const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Pool do PostgreSQL será passado como parâmetro
let pool;

const initAuthRoutes = (pgPool) => {
  pool = pgPool;
  return router;
};

// ============================================
// REGISTRO DE NOVO USUÁRIO
// ============================================
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Validações
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  try {
    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email.toLowerCase(), passwordHash, name, 'user']
    );

    const user = result.rows[0];

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 dias
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Buscar usuário
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ============================================
// OBTER DADOS DO USUÁRIO LOGADO
// ============================================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

// ============================================
// ESQUECI A SENHA - Gerar token de reset
// ============================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    // Verificar se usuário existe
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({
        message: 'Se o email existir, você receberá um link para redefinir sua senha',
        token: null // Em produção, enviar por email
      });
    }

    const user = userResult.rows[0];

    // Gerar token único (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // EM PRODUÇÃO: Enviar email com o link
    // const resetLink = `http://seusite.com/reset-password/${resetToken}`;
    // await sendEmail(user.email, 'Redefinir Senha', resetLink);

    // PARA DESENVOLVIMENTO: Retornar o token diretamente
    res.json({
      message: 'Token de reset gerado com sucesso',
      token: resetToken, // REMOVER EM PRODUÇÃO!
      expiresAt
    });

  } catch (error) {
    console.error('Erro ao gerar token de reset:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// ============================================
// REDEFINIR SENHA - Usando token
// ============================================
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  try {
    // Verificar se token existe e está válido
    const tokenResult = await pool.query(
      'SELECT user_id, expires_at, used FROM password_resets WHERE token = $1',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const resetRecord = tokenResult.rows[0];

    // Verificar se token já foi usado
    if (resetRecord.used) {
      return res.status(400).json({ error: 'Token já foi utilizado' });
    }

    // Verificar se token expirou
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha do usuário
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, resetRecord.user_id]
    );

    // Marcar token como usado
    await pool.query(
      'UPDATE password_resets SET used = TRUE WHERE token = $1',
      [token]
    );

    res.json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// ============================================
// LOGOUT (opcional - limpa token do lado do cliente)
// ============================================
router.post('/logout', authenticateToken, (req, res) => {
  // Em JWT stateless, o logout é feito no cliente (removendo o token)
  // Aqui você pode adicionar lógica adicional se necessário (ex: blacklist de tokens)
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = { initAuthRoutes };
