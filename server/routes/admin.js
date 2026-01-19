const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Pool do PostgreSQL será passado como parâmetro
let pool;

const initAdminRoutes = (pgPool) => {
  pool = pgPool;
  return router;
};

// Todas as rotas de admin requerem autenticação E permissão de admin
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================
// LISTAR TODOS OS USUÁRIOS
// ============================================
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// ============================================
// OBTER DETALHES DE UM USUÁRIO
// ============================================
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// ============================================
// ATUALIZAR USUÁRIO (nome, email, role)
// ============================================
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  // Validações
  if (!name && !email && !role) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  }

  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role inválida. Use "user" ou "admin"' });
  }

  try {
    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se email já está em uso (por outro usuário)
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    // Construir query dinâmica
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email.toLowerCase());
    }

    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, role, created_at`;

    const result = await pool.query(query, values);

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// ============================================
// REDEFINIR SENHA DE UM USUÁRIO (Admin)
// ============================================
router.put('/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Nova senha é obrigatória' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  try {
    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// ============================================
// DELETAR USUÁRIO
// ============================================
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Impedir admin de deletar a si mesmo
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const deletedUser = userCheck.rows[0];

    // Deletar usuário (cascade vai deletar todos os dados relacionados)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      message: 'Usuário deletado com sucesso',
      deletedUser: {
        id: deletedUser.id,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// ============================================
// ESTATÍSTICAS DO SISTEMA
// ============================================
router.get('/stats', async (req, res) => {
  try {
    // Total de usuários
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Usuários por role
    const rolesResult = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    // Usuários criados nos últimos 7 dias
    const recentUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );

    res.json({
      totalUsers,
      usersByRole: rolesResult.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {}),
      recentUsers: parseInt(recentUsersResult.rows[0].count)
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = { initAdminRoutes };
