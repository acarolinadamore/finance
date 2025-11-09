const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  } else {
    console.log('Conectado ao PostgreSQL com sucesso!');
    release();
  }
});

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

// Rota para obter todas as transações
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY display_order ASC NULLS LAST, id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Rota para atualizar a ordem das transações (DEVE VIR ANTES DE /:id)
app.put('/api/transactions/reorder', async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE transactions SET display_order = $1 WHERE id = $2',
          [item.display_order, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

// Rota para criar uma nova transação
app.post('/api/transactions', async (req, res) => {
  const { due_date, closing_date, description, category, amount, estimated_amount, type, status } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO transactions (due_date, closing_date, description, category, amount, estimated_amount, type, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [due_date, closing_date, description, category, amount, estimated_amount, type, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Rota para atualizar uma transação
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { due_date, closing_date, description, category, amount, estimated_amount, type, status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE transactions SET due_date = $1, closing_date = $2, description = $3, category = $4, amount = $5, estimated_amount = $6, type = $7, status = $8 WHERE id = $9 RETURNING *',
      [due_date, closing_date, description, category, amount, estimated_amount, type, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Rota para deletar uma transação
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

// Rota para obter resumo financeiro
app.get('/api/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount WHEN type = 'expense' AND status = 'paid' THEN -amount ELSE 0 END) as balance
      FROM transactions
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// ============= ROTAS DE CATEGORIAS =============

// Rota para obter todas as categorias
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Rota para criar uma nova categoria
app.post('/api/categories', async (req, res) => {
  const { name, color } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
      [name, color || '#6B7280']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// Rota para atualizar uma categoria
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name, color, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Rota para deletar uma categoria
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

// ========================================
// ROTAS DA WISHLIST
// ========================================

// Obter todas as wishlists com seus itens e preços
app.get('/api/wishlists', async (req, res) => {
  try {
    const wishlists = await pool.query('SELECT * FROM wishlists ORDER BY display_order ASC NULLS LAST, created_at DESC');

    const wishlistsWithItems = await Promise.all(
      wishlists.rows.map(async (wishlist) => {
        const items = await pool.query(
          'SELECT * FROM wishlist_items WHERE wishlist_id = $1 ORDER BY created_at ASC',
          [wishlist.id]
        );

        // Para cada item, buscar seus preços
        const itemsWithPrices = await Promise.all(
          items.rows.map(async (item) => {
            const prices = await pool.query(
              'SELECT * FROM wishlist_item_prices WHERE item_id = $1 ORDER BY created_at ASC',
              [item.id]
            );
            return {
              ...item,
              prices: prices.rows
            };
          })
        );

        return {
          ...wishlist,
          items: itemsWithPrices
        };
      })
    );

    res.json(wishlistsWithItems);
  } catch (error) {
    console.error('Erro ao buscar wishlists:', error);
    res.status(500).json({ error: 'Erro ao buscar wishlists' });
  }
});

// Criar nova wishlist
app.post('/api/wishlists', async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO wishlists (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ ...result.rows[0], items: [] });
  } catch (error) {
    console.error('Erro ao criar wishlist:', error);
    res.status(500).json({ error: 'Erro ao criar wishlist' });
  }
});

// Atualizar nome da wishlist
app.put('/api/wishlists/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE wishlists SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar wishlist:', error);
    res.status(500).json({ error: 'Erro ao atualizar wishlist' });
  }
});

// Excluir wishlist (CASCADE vai excluir os itens também)
app.delete('/api/wishlists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM wishlists WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist não encontrada' });
    }

    res.json({ message: 'Wishlist excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir wishlist:', error);
    res.status(500).json({ error: 'Erro ao excluir wishlist' });
  }
});

// Reordenar wishlists
app.put('/api/wishlists/reorder', async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE wishlists SET display_order = $1 WHERE id = $2',
          [item.display_order, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

// Adicionar item à wishlist
app.post('/api/wishlists/:wishlistId/items', async (req, res) => {
  const { wishlistId } = req.params;
  const { name, price, link } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO wishlist_items (wishlist_id, name, price, link) VALUES ($1, $2, $3, $4) RETURNING *',
      [wishlistId, name, price, link || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item (principalmente para marcar/desmarcar checkbox)
app.put('/api/wishlist-items/:id', async (req, res) => {
  const { id } = req.params;
  const { checked, selected, name, price, link } = req.body;

  try {
    let query = 'UPDATE wishlist_items SET ';
    const values = [];
    let paramCount = 1;

    if (checked !== undefined) {
      query += `checked = $${paramCount}, `;
      values.push(checked);
      paramCount++;
    }
    if (selected !== undefined) {
      query += `selected = $${paramCount}, `;
      values.push(selected);
      paramCount++;
    }
    if (name !== undefined) {
      query += `name = $${paramCount}, `;
      values.push(name);
      paramCount++;
    }
    if (price !== undefined) {
      query += `price = $${paramCount}, `;
      values.push(price);
      paramCount++;
    }
    if (link !== undefined) {
      query += `link = $${paramCount}, `;
      values.push(link);
      paramCount++;
    }

    // Remove última vírgula e espaço
    query = query.slice(0, -2);
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Excluir item
app.delete('/api/wishlist-items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM wishlist_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ error: 'Erro ao excluir item' });
  }
});

// ========================================
// ROTAS DE PREÇOS DOS ITENS
// ========================================

// Obter todos os preços de um item
app.get('/api/wishlist-items/:itemId/prices', async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM wishlist_item_prices WHERE item_id = $1 ORDER BY created_at ASC',
      [itemId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ error: 'Erro ao buscar preços' });
  }
});

// Adicionar preço a um item
app.post('/api/wishlist-items/:itemId/prices', async (req, res) => {
  const { itemId } = req.params;
  const { price, link, store_name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO wishlist_item_prices (item_id, price, link, store_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [itemId, price, link || null, store_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar preço:', error);
    res.status(500).json({ error: 'Erro ao adicionar preço' });
  }
});

// Atualizar preço
app.put('/api/wishlist-item-prices/:id', async (req, res) => {
  const { id } = req.params;
  const { price, link, store_name, selected } = req.body;

  try {
    let query = 'UPDATE wishlist_item_prices SET ';
    const values = [];
    let paramCount = 1;

    if (price !== undefined) {
      query += `price = $${paramCount}, `;
      values.push(price);
      paramCount++;
    }
    if (link !== undefined) {
      query += `link = $${paramCount}, `;
      values.push(link);
      paramCount++;
    }
    if (store_name !== undefined) {
      query += `store_name = $${paramCount}, `;
      values.push(store_name);
      paramCount++;
    }
    if (selected !== undefined) {
      query += `selected = $${paramCount}, `;
      values.push(selected);
      paramCount++;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preço não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar preço:', error);
    res.status(500).json({ error: 'Erro ao atualizar preço' });
  }
});

// Excluir preço
app.delete('/api/wishlist-item-prices/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM wishlist_item_prices WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preço não encontrado' });
    }

    res.json({ message: 'Preço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir preço:', error);
    res.status(500).json({ error: 'Erro ao excluir preço' });
  }
});

// ========================================
// ROTAS DA LISTA DE MERCADO
// ========================================

// Obter todas as listas de mercado com seus itens
app.get('/api/shopping-lists', async (req, res) => {
  try {
    const lists = await pool.query('SELECT * FROM shopping_lists ORDER BY display_order ASC NULLS LAST, created_at DESC');

    const listsWithItems = await Promise.all(
      lists.rows.map(async (list) => {
        const items = await pool.query(
          'SELECT * FROM shopping_list_items WHERE list_id = $1 ORDER BY created_at ASC',
          [list.id]
        );
        return {
          ...list,
          items: items.rows
        };
      })
    );

    res.json(listsWithItems);
  } catch (error) {
    console.error('Erro ao buscar listas de mercado:', error);
    res.status(500).json({ error: 'Erro ao buscar listas de mercado' });
  }
});

// Criar nova lista de mercado
app.post('/api/shopping-lists', async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO shopping_lists (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ ...result.rows[0], items: [] });
  } catch (error) {
    console.error('Erro ao criar lista de mercado:', error);
    res.status(500).json({ error: 'Erro ao criar lista de mercado' });
  }
});

// Atualizar nome da lista de mercado
app.put('/api/shopping-lists/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE shopping_lists SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar lista:', error);
    res.status(500).json({ error: 'Erro ao atualizar lista' });
  }
});

// Excluir lista de mercado
app.delete('/api/shopping-lists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM shopping_lists WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }

    res.json({ message: 'Lista excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lista:', error);
    res.status(500).json({ error: 'Erro ao excluir lista' });
  }
});

// Reordenar listas de mercado
app.put('/api/shopping-lists/reorder', async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE shopping_lists SET display_order = $1 WHERE id = $2',
          [item.display_order, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

// Adicionar item à lista de mercado
app.post('/api/shopping-lists/:listId/items', async (req, res) => {
  const { listId } = req.params;
  const { name, price } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO shopping_list_items (list_id, name, price) VALUES ($1, $2, $3) RETURNING *',
      [listId, name, price || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item
app.put('/api/shopping-list-items/:id', async (req, res) => {
  const { id } = req.params;
  const { checked, selected, name, price } = req.body;

  try {
    let query = 'UPDATE shopping_list_items SET ';
    const values = [];
    let paramCount = 1;

    if (checked !== undefined) {
      query += `checked = $${paramCount}, `;
      values.push(checked);
      paramCount++;
    }
    if (selected !== undefined) {
      query += `selected = $${paramCount}, `;
      values.push(selected);
      paramCount++;
    }
    if (name !== undefined) {
      query += `name = $${paramCount}, `;
      values.push(name);
      paramCount++;
    }
    if (price !== undefined) {
      query += `price = $${paramCount}, `;
      values.push(price);
      paramCount++;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Excluir item
app.delete('/api/shopping-list-items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM shopping_list_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ error: 'Erro ao excluir item' });
  }
});

// ==================== ROTAS DE METAS ====================

// Obter todas as áreas da vida
app.get('/api/life-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM life_areas ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar áreas da vida:', error);
    res.status(500).json({ error: 'Erro ao buscar áreas da vida' });
  }
});

// Atualizar nível de satisfação de uma área da vida
app.put('/api/life-areas/:id', async (req, res) => {
  const { id } = req.params;
  const { satisfaction_level } = req.body;

  try {
    const result = await pool.query(
      'UPDATE life_areas SET satisfaction_level = $1 WHERE id = $2 RETURNING *',
      [satisfaction_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar área:', error);
    res.status(500).json({ error: 'Erro ao atualizar área' });
  }
});

// Obter todas as metas com suas tarefas
app.get('/api/goals', async (req, res) => {
  try {
    const goalsResult = await pool.query(`
      SELECT g.*, la.name as life_area_name, la.color as life_area_color
      FROM goals g
      LEFT JOIN life_areas la ON g.life_area_id = la.id
      ORDER BY g.created_at DESC
    `);

    const goals = goalsResult.rows;

    // Para cada meta, buscar suas tarefas
    for (let goal of goals) {
      const tasksResult = await pool.query(
        'SELECT * FROM goal_tasks WHERE goal_id = $1 ORDER BY display_order ASC, created_at ASC',
        [goal.id]
      );
      goal.tasks = tasksResult.rows;
    }

    res.json(goals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

// Criar uma nova meta
app.post('/api/goals', async (req, res) => {
  const { title, life_area_id, motivo, current_situation, desired_outcome, obstaculo, recompensa, prazo_tipo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO goals (title, life_area_id, motivo, current_situation, desired_outcome, obstaculo, recompensa, prazo_tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, life_area_id || null, motivo, current_situation, desired_outcome, obstaculo, recompensa, prazo_tipo || null]
    );

    const newGoal = result.rows[0];
    newGoal.tasks = [];

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

// Atualizar uma meta
app.put('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { title, life_area_id, motivo, current_situation, desired_outcome, obstaculo, recompensa, prazo_tipo, progress } = req.body;

  try {
    const result = await pool.query(
      'UPDATE goals SET title = $1, life_area_id = $2, motivo = $3, current_situation = $4, desired_outcome = $5, obstaculo = $6, recompensa = $7, prazo_tipo = $8, progress = $9 WHERE id = $10 RETURNING *',
      [title, life_area_id || null, motivo, current_situation, desired_outcome, obstaculo, recompensa, prazo_tipo || null, progress, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Excluir uma meta
app.delete('/api/goals/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM goals WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({ error: 'Erro ao excluir meta' });
  }
});

// Adicionar tarefa a uma meta
app.post('/api/goals/:goalId/tasks', async (req, res) => {
  const { goalId } = req.params;
  const { title, description, deadline } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO goal_tasks (goal_id, title, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [goalId, title, description || null, deadline || null]
    );

    // Recalcular progresso da meta
    await recalculateGoalProgress(goalId);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ error: 'Erro ao adicionar tarefa' });
  }
});

// Atualizar uma tarefa
app.put('/api/goal-tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, completed } = req.body;

  try {
    // Buscar tarefa atual
    const currentTask = await pool.query('SELECT * FROM goal_tasks WHERE id = $1', [id]);

    if (currentTask.rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    // Usar valores atuais se não fornecidos
    const task = currentTask.rows[0];
    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDescription = description !== undefined ? description : task.description;
    const updatedDeadline = deadline !== undefined ? deadline : task.deadline;
    const updatedCompleted = completed !== undefined ? completed : task.completed;

    const result = await pool.query(
      'UPDATE goal_tasks SET title = $1, description = $2, deadline = $3, completed = $4 WHERE id = $5 RETURNING *',
      [updatedTitle, updatedDescription, updatedDeadline, updatedCompleted, id]
    );

    // Recalcular progresso da meta
    await recalculateGoalProgress(result.rows[0].goal_id);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// Excluir uma tarefa
app.delete('/api/goal-tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const taskResult = await pool.query('SELECT goal_id FROM goal_tasks WHERE id = $1', [id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const goalId = taskResult.rows[0].goal_id;

    await pool.query('DELETE FROM goal_tasks WHERE id = $1', [id]);

    // Recalcular progresso da meta
    await recalculateGoalProgress(goalId);

    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

// Função auxiliar para recalcular o progresso da meta
async function recalculateGoalProgress(goalId) {
  try {
    const tasksResult = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed FROM goal_tasks WHERE goal_id = $1',
      [goalId]
    );

    const { total, completed } = tasksResult.rows[0];
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await pool.query('UPDATE goals SET progress = $1 WHERE id = $2', [progress, goalId]);
  } catch (error) {
    console.error('Erro ao recalcular progresso:', error);
  }
}

// ===== ROTAS DE DREAMS (SONHOS) =====

// Listar todos os sonhos
app.get('/api/dreams', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, la.name as life_area_name, la.color as life_area_color
       FROM dreams d
       LEFT JOIN life_areas la ON d.life_area_id = la.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar sonhos:', error);
    res.status(500).json({ error: 'Erro ao buscar sonhos' });
  }
});

// Criar um novo sonho
app.post('/api/dreams', async (req, res) => {
  const { title, description, image, deadline, life_area_id, prazo_tipo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO dreams (title, description, image, deadline, life_area_id, prazo_tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || null, image || null, deadline || null, life_area_id || null, prazo_tipo || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar sonho:', error);
    res.status(500).json({ error: 'Erro ao criar sonho' });
  }
});

// Atualizar um sonho
app.put('/api/dreams/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image, deadline, life_area_id, prazo_tipo } = req.body;

  try {
    const result = await pool.query(
      'UPDATE dreams SET title = $1, description = $2, image = $3, deadline = $4, life_area_id = $5, prazo_tipo = $6 WHERE id = $7 RETURNING *',
      [title, description || null, image || null, deadline || null, life_area_id || null, prazo_tipo || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sonho não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar sonho:', error);
    res.status(500).json({ error: 'Erro ao atualizar sonho' });
  }
});

// Excluir um sonho
app.delete('/api/dreams/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM dreams WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sonho não encontrado' });
    }

    res.json({ message: 'Sonho excluído com sucesso', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao excluir sonho:', error);
    res.status(500).json({ error: 'Erro ao excluir sonho' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = pool;
