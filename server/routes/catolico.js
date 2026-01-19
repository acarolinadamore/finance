const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Pool do PostgreSQL será passado como parâmetro
let pool;

const initCatolicoRoutes = (pgPool) => {
  pool = pgPool;
  return router;
};

// ============================================
// ROTAS DE ORAÇÕES
// ============================================

// Obter todas as orações do usuário
router.get('/prayers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prayers WHERE user_id = $1 ORDER BY is_favorite DESC, created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar orações:', error);
    res.status(500).json({ error: 'Erro ao buscar orações' });
  }
});

// Criar nova oração
router.post('/prayers', authenticateToken, async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO prayers (user_id, title, content, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, title, content, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar oração:', error);
    res.status(500).json({ error: 'Erro ao criar oração' });
  }
});

// Atualizar oração
router.put('/prayers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, category, is_favorite } = req.body;

  try {
    const result = await pool.query(
      'UPDATE prayers SET title = $1, content = $2, category = $3, is_favorite = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, content, category, is_favorite, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oração não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar oração:', error);
    res.status(500).json({ error: 'Erro ao atualizar oração' });
  }
});

// Deletar oração
router.delete('/prayers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM prayers WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oração não encontrada' });
    }

    res.json({ message: 'Oração deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar oração:', error);
    res.status(500).json({ error: 'Erro ao deletar oração' });
  }
});

// ============================================
// ROTAS DE LEITURAS ESPIRITUAIS
// ============================================

// Obter todas as leituras do usuário
router.get('/readings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM spiritual_readings WHERE user_id = $1 ORDER BY date_read DESC NULLS LAST, created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar leituras:', error);
    res.status(500).json({ error: 'Erro ao buscar leituras' });
  }
});

// Criar nova leitura
router.post('/readings', authenticateToken, async (req, res) => {
  const { title, author, book_name, reference, content, notes, date_read } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO spiritual_readings (user_id, title, author, book_name, reference, content, notes, date_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.userId, title, author, book_name, reference, content, notes, date_read]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar leitura:', error);
    res.status(500).json({ error: 'Erro ao criar leitura' });
  }
});

// Atualizar leitura
router.put('/readings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, author, book_name, reference, content, notes, date_read, is_favorite } = req.body;

  try {
    const result = await pool.query(
      'UPDATE spiritual_readings SET title = $1, author = $2, book_name = $3, reference = $4, content = $5, notes = $6, date_read = $7, is_favorite = $8 WHERE id = $9 AND user_id = $10 RETURNING *',
      [title, author, book_name, reference, content, notes, date_read, is_favorite, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar leitura:', error);
    res.status(500).json({ error: 'Erro ao atualizar leitura' });
  }
});

// Deletar leitura
router.delete('/readings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM spiritual_readings WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    res.json({ message: 'Leitura deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar leitura:', error);
    res.status(500).json({ error: 'Erro ao deletar leitura' });
  }
});

// ============================================
// ROTAS DE CONFISSÕES
// ============================================

// Obter todas as confissões do usuário
router.get('/confessions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM confessions WHERE user_id = $1 ORDER BY confession_date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar confissões:', error);
    res.status(500).json({ error: 'Erro ao buscar confissões' });
  }
});

// Criar nova confissão
router.post('/confessions', authenticateToken, async (req, res) => {
  const { confession_date, notes, penance, confessor_name, location, is_completed } = req.body;

  if (!confession_date) {
    return res.status(400).json({ error: 'Data da confissão é obrigatória' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO confessions (user_id, confession_date, notes, penance, confessor_name, location, is_completed) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, confession_date, notes, penance, confessor_name, location, is_completed]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar confissão:', error);
    res.status(500).json({ error: 'Erro ao criar confissão' });
  }
});

// Atualizar confissão
router.put('/confessions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { confession_date, notes, penance, confessor_name, location, is_completed } = req.body;

  try {
    const result = await pool.query(
      'UPDATE confessions SET confession_date = $1, notes = $2, penance = $3, confessor_name = $4, location = $5, is_completed = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [confession_date, notes, penance, confessor_name, location, is_completed, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Confissão não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar confissão:', error);
    res.status(500).json({ error: 'Erro ao atualizar confissão' });
  }
});

// Deletar confissão
router.delete('/confessions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM confessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Confissão não encontrada' });
    }

    res.json({ message: 'Confissão deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar confissão:', error);
    res.status(500).json({ error: 'Erro ao deletar confissão' });
  }
});

// ============================================
// ROTAS DE TRACKING DE ORAÇÕES DIÁRIAS
// ============================================

// Obter tracking de orações (com filtro opcional por data)
router.get('/prayer-tracking', authenticateToken, async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    let query = 'SELECT * FROM daily_prayer_tracking WHERE user_id = $1';
    const params = [req.user.userId];

    if (start_date && end_date) {
      query += ' AND date_prayed BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY date_prayed DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tracking de orações:', error);
    res.status(500).json({ error: 'Erro ao buscar tracking de orações' });
  }
});

// Registrar oração feita
router.post('/prayer-tracking', authenticateToken, async (req, res) => {
  const { prayer_id, prayer_name, date_prayed, time_spent_minutes, notes } = req.body;

  if (!prayer_name || !date_prayed) {
    return res.status(400).json({ error: 'Nome da oração e data são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO daily_prayer_tracking (user_id, prayer_id, prayer_name, date_prayed, time_spent_minutes, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, prayer_id, prayer_name, date_prayed, time_spent_minutes, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar oração:', error);
    res.status(500).json({ error: 'Erro ao registrar oração' });
  }
});

// Deletar registro de oração
router.delete('/prayer-tracking/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM daily_prayer_tracking WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

// ============================================
// ROTAS DE PERÍODOS DE ORAÇÃO (Manhã/Tarde/Noite)
// ============================================

// Obter períodos de oração do usuário
router.get('/prayer-periods', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prayer_periods WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar períodos de oração:', error);
    res.status(500).json({ error: 'Erro ao buscar períodos de oração' });
  }
});

// Salvar/atualizar período de oração
router.post('/prayer-periods', authenticateToken, async (req, res) => {
  const { period, content } = req.body;

  if (!period || !['morning', 'afternoon', 'night'].includes(period)) {
    return res.status(400).json({ error: 'Período inválido' });
  }

  try {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT id FROM prayer_periods WHERE user_id = $1 AND period = $2',
      [req.user.userId, period]
    );

    let result;
    if (existing.rows.length > 0) {
      // Atualizar
      result = await pool.query(
        'UPDATE prayer_periods SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND period = $3 RETURNING *',
        [content, req.user.userId, period]
      );
    } else {
      // Criar novo
      result = await pool.query(
        'INSERT INTO prayer_periods (user_id, period, content) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, period, content]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar período de oração:', error);
    res.status(500).json({ error: 'Erro ao salvar período de oração' });
  }
});

// ============================================
// ROTAS DE CATEGORIAS DE ORAÇÃO (Novenas/Jaculatórias/etc)
// ============================================

// Obter categorias de oração do usuário
router.get('/prayer-categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prayer_categories WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias de oração:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias de oração' });
  }
});

// Salvar/atualizar categoria de oração
router.post('/prayer-categories', authenticateToken, async (req, res) => {
  const { category, content } = req.body;

  if (!category || !['novenas', 'ejaculations', 'penance', 'offerings'].includes(category)) {
    return res.status(400).json({ error: 'Categoria inválida' });
  }

  try {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT id FROM prayer_categories WHERE user_id = $1 AND category = $2',
      [req.user.userId, category]
    );

    let result;
    if (existing.rows.length > 0) {
      // Atualizar
      result = await pool.query(
        'UPDATE prayer_categories SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND category = $3 RETURNING *',
        [content, req.user.userId, category]
      );
    } else {
      // Criar novo
      result = await pool.query(
        'INSERT INTO prayer_categories (user_id, category, content) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, category, content]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar categoria de oração:', error);
    res.status(500).json({ error: 'Erro ao salvar categoria de oração' });
  }
});

// ============================================
// ROTAS DE NOVENAS (Cards individuais)
// ============================================

router.get('/novenas', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM novenas WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar novenas:', error);
    res.status(500).json({ error: 'Erro ao buscar novenas' });
  }
});

router.post('/novenas', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO novenas (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar novena:', error);
    res.status(500).json({ error: 'Erro ao criar novena' });
  }
});

router.put('/novenas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE novenas SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Novena não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar novena:', error);
    res.status(500).json({ error: 'Erro ao atualizar novena' });
  }
});

router.delete('/novenas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM novenas WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Novena não encontrada' });
    }
    res.json({ message: 'Novena deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar novena:', error);
    res.status(500).json({ error: 'Erro ao deletar novena' });
  }
});

router.post('/novenas/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE novenas SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar novenas:', error);
    res.status(500).json({ error: 'Erro ao reordenar novenas' });
  }
});

// ============================================
// ROTAS DE JACULATÓRIAS (Cards individuais)
// ============================================

router.get('/ejaculations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ejaculations WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar jaculatórias:', error);
    res.status(500).json({ error: 'Erro ao buscar jaculatórias' });
  }
});

router.post('/ejaculations', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO ejaculations (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar jaculatória:', error);
    res.status(500).json({ error: 'Erro ao criar jaculatória' });
  }
});

router.put('/ejaculations/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE ejaculations SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jaculatória não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar jaculatória:', error);
    res.status(500).json({ error: 'Erro ao atualizar jaculatória' });
  }
});

router.delete('/ejaculations/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM ejaculations WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jaculatória não encontrada' });
    }
    res.json({ message: 'Jaculatória deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar jaculatória:', error);
    res.status(500).json({ error: 'Erro ao deletar jaculatória' });
  }
});

router.post('/ejaculations/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE ejaculations SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar jaculatórias:', error);
    res.status(500).json({ error: 'Erro ao reordenar jaculatórias' });
  }
});

// ============================================
// ROTAS DE PENITÊNCIAS (Cards individuais)
// ============================================

router.get('/penances', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM penances WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar penitências:', error);
    res.status(500).json({ error: 'Erro ao buscar penitências' });
  }
});

router.post('/penances', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO penances (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar penitência:', error);
    res.status(500).json({ error: 'Erro ao criar penitência' });
  }
});

router.put('/penances/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE penances SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Penitência não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar penitência:', error);
    res.status(500).json({ error: 'Erro ao atualizar penitência' });
  }
});

router.delete('/penances/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM penances WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Penitência não encontrada' });
    }
    res.json({ message: 'Penitência deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar penitência:', error);
    res.status(500).json({ error: 'Erro ao deletar penitência' });
  }
});

router.post('/penances/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE penances SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar penitências:', error);
    res.status(500).json({ error: 'Erro ao reordenar penitências' });
  }
});

// ============================================
// ROTAS DE OFERECIMENTOS (Cards individuais)
// ============================================

router.get('/offerings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM offerings WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar oferecimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar oferecimentos' });
  }
});

router.post('/offerings', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO offerings (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar oferecimento:', error);
    res.status(500).json({ error: 'Erro ao criar oferecimento' });
  }
});

router.put('/offerings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE offerings SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferecimento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar oferecimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar oferecimento' });
  }
});

router.delete('/offerings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM offerings WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferecimento não encontrado' });
    }
    res.json({ message: 'Oferecimento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar oferecimento:', error);
    res.status(500).json({ error: 'Erro ao deletar oferecimento' });
  }
});

router.post('/offerings/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE offerings SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar oferecimentos:', error);
    res.status(500).json({ error: 'Erro ao reordenar oferecimentos' });
  }
});

// ============================================
// ROTAS DE VERSÍCULOS FAVORITOS
// ============================================

router.get('/verses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM favorite_verses WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar versículos:', error);
    res.status(500).json({ error: 'Erro ao buscar versículos' });
  }
});

router.post('/verses', authenticateToken, async (req, res) => {
  const { livro, capitulo, versiculo, texto } = req.body;
  if (!livro || !capitulo || !versiculo || !texto) {
    return res.status(400).json({ error: 'Livro, capítulo, versículo e texto são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO favorite_verses (user_id, livro, capitulo, versiculo, texto) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, livro, capitulo, versiculo, texto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar versículo:', error);
    res.status(500).json({ error: 'Erro ao criar versículo' });
  }
});

router.put('/verses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { livro, capitulo, versiculo, texto } = req.body;

  try {
    const result = await pool.query(
      'UPDATE favorite_verses SET livro = $1, capitulo = $2, versiculo = $3, texto = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [livro, capitulo, versiculo, texto, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Versículo não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar versículo:', error);
    res.status(500).json({ error: 'Erro ao atualizar versículo' });
  }
});

router.delete('/verses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM favorite_verses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Versículo não encontrado' });
    }
    res.json({ message: 'Versículo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar versículo:', error);
    res.status(500).json({ error: 'Erro ao deletar versículo' });
  }
});

router.post('/verses/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE favorite_verses SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar versículos:', error);
    res.status(500).json({ error: 'Erro ao reordenar versículos' });
  }
});

// ============================================
// ROTAS DE DÚVIDAS ESPIRITUAIS
// ============================================

router.get('/questions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM spiritual_questions WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dúvidas:', error);
    res.status(500).json({ error: 'Erro ao buscar dúvidas' });
  }
});

router.post('/questions', authenticateToken, async (req, res) => {
  const { pergunta, contexto } = req.body;
  if (!pergunta) {
    return res.status(400).json({ error: 'Pergunta é obrigatória' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO spiritual_questions (user_id, pergunta, contexto) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, pergunta, contexto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar dúvida:', error);
    res.status(500).json({ error: 'Erro ao criar dúvida' });
  }
});

router.put('/questions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { pergunta, contexto, resposta, status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE spiritual_questions SET pergunta = $1, contexto = $2, resposta = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
      [pergunta, contexto, resposta, status, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dúvida não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar dúvida:', error);
    res.status(500).json({ error: 'Erro ao atualizar dúvida' });
  }
});

router.delete('/questions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM spiritual_questions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dúvida não encontrada' });
    }
    res.json({ message: 'Dúvida deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar dúvida:', error);
    res.status(500).json({ error: 'Erro ao deletar dúvida' });
  }
});

router.post('/questions/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE spiritual_questions SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar dúvidas:', error);
    res.status(500).json({ error: 'Erro ao reordenar dúvidas' });
  }
});

// ============================================
// ROTAS DO TERÇO (Oferecimento e Mistérios)
// ============================================

router.get('/rosary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rosary_content WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar conteúdo do terço:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo do terço' });
  }
});

router.post('/rosary', authenticateToken, async (req, res) => {
  const { tipo, conteudo } = req.body;

  if (!tipo || !['oferecimento', 'gloriosos', 'gozosos', 'dolorosos', 'oracoes_finais'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  try {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT id FROM rosary_content WHERE user_id = $1 AND tipo = $2',
      [req.user.userId, tipo]
    );

    let result;
    if (existing.rows.length > 0) {
      // Atualizar
      result = await pool.query(
        'UPDATE rosary_content SET conteudo = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND tipo = $3 RETURNING *',
        [conteudo, req.user.userId, tipo]
      );
    } else {
      // Criar novo
      result = await pool.query(
        'INSERT INTO rosary_content (user_id, tipo, conteudo) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, tipo, conteudo]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar conteúdo do terço:', error);
    res.status(500).json({ error: 'Erro ao salvar conteúdo do terço' });
  }
});

// ============================================
// ROTAS DE LECTIO DIVINA
// ============================================

router.get('/lectio-divina', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lectio_divina WHERE user_id = $1 ORDER BY data DESC, id DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar lectio divina:', error);
    res.status(500).json({ error: 'Erro ao buscar lectio divina' });
  }
});

router.post('/lectio-divina', authenticateToken, async (req, res) => {
  const { data, livro, capitulo, versiculo, lectio, meditatio, oratio, contemplatio } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO lectio_divina (user_id, data, livro, capitulo, versiculo, lectio, meditatio, oratio, contemplatio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [req.user.userId, data, livro, capitulo, versiculo, lectio, meditatio, oratio, contemplatio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar lectio divina:', error);
    res.status(500).json({ error: 'Erro ao criar lectio divina' });
  }
});

router.put('/lectio-divina/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { data, livro, capitulo, versiculo, lectio, meditatio, oratio, contemplatio } = req.body;

  try {
    const result = await pool.query(
      'UPDATE lectio_divina SET data = $1, livro = $2, capitulo = $3, versiculo = $4, lectio = $5, meditatio = $6, oratio = $7, contemplatio = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND user_id = $10 RETURNING *',
      [data, livro, capitulo, versiculo, lectio, meditatio, oratio, contemplatio, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lectio Divina não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar lectio divina:', error);
    res.status(500).json({ error: 'Erro ao atualizar lectio divina' });
  }
});

router.delete('/lectio-divina/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM lectio_divina WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lectio Divina não encontrada' });
    }
    res.json({ message: 'Lectio Divina deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lectio divina:', error);
    res.status(500).json({ error: 'Erro ao deletar lectio divina' });
  }
});

// ============================================
// ROTAS DE INTERCESSÕES (Cards individuais)
// ============================================

router.get('/intercessions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM intercessions WHERE user_id = $1 ORDER BY display_order ASC, id ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar intercessões:', error);
    res.status(500).json({ error: 'Erro ao buscar intercessões' });
  }
});

router.post('/intercessions', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  try {
    // Buscar o próximo display_order
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM intercessions WHERE user_id = $1',
      [req.user.userId]
    );

    const result = await pool.query(
      'INSERT INTO intercessions (user_id, title, content, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, title, content, maxOrder.rows[0].next_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar intercessão:', error);
    res.status(500).json({ error: 'Erro ao criar intercessão' });
  }
});

router.put('/intercessions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE intercessions SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intercessão não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar intercessão:', error);
    res.status(500).json({ error: 'Erro ao atualizar intercessão' });
  }
});

router.delete('/intercessions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM intercessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intercessão não encontrada' });
    }
    res.json({ message: 'Intercessão deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar intercessão:', error);
    res.status(500).json({ error: 'Erro ao deletar intercessão' });
  }
});

router.post('/intercessions/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      await pool.query(
        'UPDATE intercessions SET display_order = $1 WHERE id = $2 AND user_id = $3',
        [order.display_order, order.id, req.user.userId]
      );
    }
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar intercessões:', error);
    res.status(500).json({ error: 'Erro ao reordenar intercessões' });
  }
});

module.exports = { initCatolicoRoutes };
