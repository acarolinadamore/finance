const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3032;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3031',
    'http://127.0.0.1:8081',
    'http://192.168.100.108:8081',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
    'http://192.168.100.108:19006'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/skincare');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'skincare-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif)'));
  }
});

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Importar rotas de autenticação e admin
const { initAuthRoutes } = require('./routes/auth');
const { initAdminRoutes } = require('./routes/admin');
const { initCatolicoRoutes } = require('./routes/catolico');
const { authenticateToken } = require('./middleware/auth');

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR INICIADO - ' + new Date().toLocaleString());
    console.log('='.repeat(60));
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    console.log('📍 Porta:', process.env.PORT || 3032);
    console.log('='.repeat(60) + '\n');
    release();
  }
});

// ============================================
// ROTAS DE AUTENTICAÇÃO (públicas)
// ============================================
app.use('/api/auth', initAuthRoutes(pool));

// ============================================
// ROTAS DE ADMINISTRAÇÃO (requer autenticação + admin)
// ============================================
app.use('/api/admin', initAdminRoutes(pool));

// ============================================
// ROTAS DO MÓDULO CATÓLICO (requer autenticação)
// ============================================
app.use('/api/catolico', initCatolicoRoutes(pool));

// ============================================
// ROTAS GERAIS
// ============================================
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

// ========================================
// ROTAS DA LISTA DE ACESSOS
// ========================================

// Obter todas as listas de acessos com seus itens
app.get('/api/access-lists', authenticateToken, async (req, res) => {
  try {
    const lists = await pool.query('SELECT * FROM access_lists ORDER BY display_order ASC NULLS LAST, created_at DESC');

    const listsWithItems = await Promise.all(
      lists.rows.map(async (list) => {
        const items = await pool.query(
          'SELECT * FROM access_list_items WHERE list_id = $1 ORDER BY created_at ASC',
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
    console.error('Erro ao buscar listas de acessos:', error);
    res.status(500).json({ error: 'Erro ao buscar listas de acessos' });
  }
});

// Criar nova lista de acessos
app.post('/api/access-lists', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO access_lists (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ ...result.rows[0], items: [] });
  } catch (error) {
    console.error('Erro ao criar lista de acessos:', error);
    res.status(500).json({ error: 'Erro ao criar lista de acessos' });
  }
});

// Reordenar listas de acessos (PRECISA VIR ANTES DE /:id)
app.put('/api/access-lists/reorder', authenticateToken, async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE access_lists SET display_order = $1 WHERE id = $2',
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

// Atualizar nome da lista de acessos
app.put('/api/access-lists/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE access_lists SET name = $1 WHERE id = $2 RETURNING *',
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

// Excluir lista de acessos
app.delete('/api/access-lists/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM access_lists WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }

    res.json({ message: 'Lista excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lista:', error);
    res.status(500).json({ error: 'Erro ao excluir lista' });
  }
});

// Adicionar item à lista de acessos
app.post('/api/access-lists/:listId/items', authenticateToken, async (req, res) => {
  const { listId } = req.params;
  const { title, url, username, password } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO access_list_items (list_id, title, url, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [listId, title, url || null, username || null, password || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item
app.put('/api/access-list-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, url, username, password } = req.body;

  try {
    let query = 'UPDATE access_list_items SET ';
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      query += `title = $${paramCount}, `;
      values.push(title);
      paramCount++;
    }
    if (url !== undefined) {
      query += `url = $${paramCount}, `;
      values.push(url);
      paramCount++;
    }
    if (username !== undefined) {
      query += `username = $${paramCount}, `;
      values.push(username);
      paramCount++;
    }
    if (password !== undefined) {
      query += `password = $${paramCount}, `;
      values.push(password);
      paramCount++;
    }

    if (paramCount === 1) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
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
app.delete('/api/access-list-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM access_list_items WHERE id = $1 RETURNING *', [id]);

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
      ORDER BY g.display_order ASC NULLS LAST, g.created_at DESC
    `);

    const goals = goalsResult.rows;

    // Para cada meta, buscar suas tarefas e tags
    for (let goal of goals) {
      const tasksResult = await pool.query(
        'SELECT * FROM goal_tasks WHERE goal_id = $1 ORDER BY display_order ASC, created_at ASC',
        [goal.id]
      );
      goal.tasks = tasksResult.rows;

      const tagsResult = await pool.query(
        `SELECT t.id, t.name, t.color
         FROM goal_tags gt
         JOIN tags t ON gt.tag_id = t.id
         WHERE gt.goal_id = $1
         ORDER BY t.name`,
        [goal.id]
      );
      goal.tags = tagsResult.rows;
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

// Reordenar metas - DEVE VIR ANTES DE /:id
app.put('/api/goals/reorder', async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE goals SET display_order = $1 WHERE id = $2',
          [item.display_order, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem das metas atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao reordenar metas:', error);
    res.status(500).json({ error: 'Erro ao reordenar metas' });
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
    // Buscar todos os sonhos
    const dreamsResult = await pool.query(
      `SELECT d.*, la.name as life_area_name, la.color as life_area_color
       FROM dreams d
       LEFT JOIN life_areas la ON d.life_area_id = la.id
       ORDER BY d.display_order ASC NULLS LAST, d.created_at DESC`
    );

    // Para cada sonho, buscar as metas vinculadas e tags
    const dreams = await Promise.all(
      dreamsResult.rows.map(async (dream) => {
        const goalsResult = await pool.query(
          `SELECT g.id, g.title, g.progress, la.color as life_area_color
           FROM dream_goals dg
           JOIN goals g ON dg.goal_id = g.id
           LEFT JOIN life_areas la ON g.life_area_id = la.id
           WHERE dg.dream_id = $1
           ORDER BY g.title`,
          [dream.id]
        );

        const tagsResult = await pool.query(
          `SELECT t.id, t.name, t.color
           FROM dream_tags dt
           JOIN tags t ON dt.tag_id = t.id
           WHERE dt.dream_id = $1
           ORDER BY t.name`,
          [dream.id]
        );

        return {
          ...dream,
          linked_goals: goalsResult.rows,
          tags: tagsResult.rows
        };
      })
    );

    res.json(dreams);
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

// Reordenar sonhos - DEVE VIR ANTES DE /:id
app.put('/api/dreams/reorder', async (req, res) => {
  const { orders } = req.body; // Array de { id, display_order }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE dreams SET display_order = $1 WHERE id = $2',
          [item.display_order, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem dos sonhos atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao reordenar sonhos:', error);
    res.status(500).json({ error: 'Erro ao reordenar sonhos' });
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

// Vincular meta a um sonho
app.post('/api/dreams/:dreamId/goals/:goalId', async (req, res) => {
  const { dreamId, goalId } = req.params;

  try {
    await pool.query(
      'INSERT INTO dream_goals (dream_id, goal_id) VALUES ($1, $2) ON CONFLICT (dream_id, goal_id) DO NOTHING',
      [dreamId, goalId]
    );

    res.json({ message: 'Meta vinculada ao sonho com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular meta ao sonho:', error);
    res.status(500).json({ error: 'Erro ao vincular meta ao sonho' });
  }
});

// Desvincular meta de um sonho
app.delete('/api/dreams/:dreamId/goals/:goalId', async (req, res) => {
  const { dreamId, goalId } = req.params;

  try {
    await pool.query(
      'DELETE FROM dream_goals WHERE dream_id = $1 AND goal_id = $2',
      [dreamId, goalId]
    );

    res.json({ message: 'Meta desvinculada do sonho com sucesso' });
  } catch (error) {
    console.error('Erro ao desvincular meta do sonho:', error);
    res.status(500).json({ error: 'Erro ao desvincular meta do sonho' });
  }
});

// ================================
// ENDPOINTS DE TAGS
// ================================

// Listar todas as tags
app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tags ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json({ error: 'Erro ao buscar tags' });
  }
});

// Criar nova tag
app.post('/api/tags', async (req, res) => {
  const { name, color } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *',
      [name, color || '#6b7280']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
});

// Vincular tag a uma meta
app.post('/api/goals/:goalId/tags/:tagId', async (req, res) => {
  const { goalId, tagId } = req.params;

  try {
    await pool.query(
      'INSERT INTO goal_tags (goal_id, tag_id) VALUES ($1, $2) ON CONFLICT (goal_id, tag_id) DO NOTHING',
      [goalId, tagId]
    );
    res.json({ message: 'Tag vinculada à meta com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular tag à meta:', error);
    res.status(500).json({ error: 'Erro ao vincular tag à meta' });
  }
});

// Desvincular tag de uma meta
app.delete('/api/goals/:goalId/tags/:tagId', async (req, res) => {
  const { goalId, tagId } = req.params;

  try {
    await pool.query(
      'DELETE FROM goal_tags WHERE goal_id = $1 AND tag_id = $2',
      [goalId, tagId]
    );
    res.json({ message: 'Tag desvinculada da meta com sucesso' });
  } catch (error) {
    console.error('Erro ao desvincular tag da meta:', error);
    res.status(500).json({ error: 'Erro ao desvincular tag da meta' });
  }
});

// Vincular tag a um sonho
app.post('/api/dreams/:dreamId/tags/:tagId', async (req, res) => {
  const { dreamId, tagId } = req.params;

  try {
    await pool.query(
      'INSERT INTO dream_tags (dream_id, tag_id) VALUES ($1, $2) ON CONFLICT (dream_id, tag_id) DO NOTHING',
      [dreamId, tagId]
    );
    res.json({ message: 'Tag vinculada ao sonho com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular tag ao sonho:', error);
    res.status(500).json({ error: 'Erro ao vincular tag ao sonho' });
  }
});

// Desvincular tag de um sonho
app.delete('/api/dreams/:dreamId/tags/:tagId', async (req, res) => {
  const { dreamId, tagId } = req.params;

  try {
    await pool.query(
      'DELETE FROM dream_tags WHERE dream_id = $1 AND tag_id = $2',
      [dreamId, tagId]
    );
    res.json({ message: 'Tag desvinculada do sonho com sucesso' });
  } catch (error) {
    console.error('Erro ao desvincular tag do sonho:', error);
    res.status(500).json({ error: 'Erro ao desvincular tag do sonho' });
  }
});

// ================================
// ENDPOINTS DE ROTINAS
// ================================

// Listar todas as rotinas
app.get('/api/routines', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM routines ORDER BY period, display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar rotinas:', error);
    res.status(500).json({ error: 'Erro ao buscar rotinas' });
  }
});

// Criar uma nova rotina
app.post('/api/routines', authenticateToken, async (req, res) => {
  console.log('📝 [POST /api/routines] Recebido req.body:', JSON.stringify(req.body, null, 2));

  const { name, period, frequency, specific_days, times_per_week, icon, color, add_to_habit_tracking } = req.body;
  const user_id = req.user.userId;

  console.log('📝 [POST /api/routines] add_to_habit_tracking =', add_to_habit_tracking);
  console.log('📝 [POST /api/routines] Tipo de add_to_habit_tracking:', typeof add_to_habit_tracking);

  try {
    const result = await pool.query(
      `INSERT INTO routines (name, period, frequency, specific_days, times_per_week, icon, color, add_to_habit_tracking, is_active, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9) RETURNING *`,
      [name, period, frequency, specific_days || null, times_per_week || null, icon || null, color || '#8b5cf6', add_to_habit_tracking || false, user_id]
    );

    const routine = result.rows[0];
    console.log('✅ [POST /api/routines] Rotina criada:', routine);

    // Se add_to_habit_tracking = true, criar automaticamente um hábito vinculado
    if (add_to_habit_tracking) {
      console.log('🔄 [POST /api/routines] Tentando criar hábito automaticamente...');
      try {
        const habitResult = await pool.query(
          `INSERT INTO habits (routine_id, name, period, frequency, specific_days, times_per_week, start_date, icon, color, is_active, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, true, $9) RETURNING *`,
          [routine.id, name, period, frequency, specific_days || null, times_per_week || null, icon || null, color || '#8b5cf6', user_id]
        );
        console.log(`✅ [POST /api/routines] Hábito criado automaticamente:`, habitResult.rows[0]);
      } catch (habitError) {
        console.error('❌ [POST /api/routines] Erro ao criar hábito automaticamente:', habitError.message);
        console.error('❌ [POST /api/routines] Stack completo:', habitError);
        // Não falha a criação da rotina se o hábito falhar
      }
    } else {
      console.log('ℹ️ [POST /api/routines] add_to_habit_tracking é false, não criando hábito');
    }

    res.status(201).json(routine);
  } catch (error) {
    console.error('❌ [POST /api/routines] Erro ao criar rotina:', error);
    res.status(500).json({ error: 'Erro ao criar rotina' });
  }
});

// Reordenar rotinas - IMPORTANTE: Deve vir ANTES de PUT /api/routines/:id
app.put('/api/routines/reorder', authenticateToken, async (req, res) => {
  console.log('🔄 [PUT /api/routines/reorder] Recebido req.body:', JSON.stringify(req.body, null, 2));
  const { orders } = req.body; // Array de { id, display_order }
  const user_id = req.user.userId;

  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'orders deve ser um array' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        console.log(`🔄 [PUT /api/routines/reorder] Atualizando rotina ${item.id} para display_order ${item.display_order}`);
        await client.query(
          'UPDATE routines SET display_order = $1 WHERE id = $2 AND user_id = $3',
          [item.display_order, item.id, user_id]
        );
      }

      await client.query('COMMIT');
      console.log('✅ [PUT /api/routines/reorder] Ordem atualizada com sucesso');
      res.json({ message: 'Ordem das rotinas atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ [PUT /api/routines/reorder] Erro ao reordenar rotinas:', error);
    res.status(500).json({ error: 'Erro ao reordenar rotinas' });
  }
});

// Atualizar uma rotina
app.put('/api/routines/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  console.log('📝 [PUT /api/routines/:id] ID:', id);
  console.log('📝 [PUT /api/routines/:id] Recebido req.body:', JSON.stringify(req.body, null, 2));

  const { name, period, frequency, specific_days, times_per_week, icon, color, add_to_habit_tracking, is_active } = req.body;

  console.log('📝 [PUT /api/routines/:id] add_to_habit_tracking =', add_to_habit_tracking);
  console.log('📝 [PUT /api/routines/:id] Tipo de add_to_habit_tracking:', typeof add_to_habit_tracking);

  try {
    // Buscar o valor anterior de add_to_habit_tracking
    const previousRoutine = await pool.query('SELECT add_to_habit_tracking FROM routines WHERE id = $1 AND user_id = $2', [id, user_id]);
    const wasTrackingBefore = previousRoutine.rows[0]?.add_to_habit_tracking || false;

    console.log('📝 [PUT /api/routines/:id] wasTrackingBefore =', wasTrackingBefore);
    console.log('📝 [PUT /api/routines/:id] Mudança:', wasTrackingBefore, '→', add_to_habit_tracking);

    const result = await pool.query(
      `UPDATE routines
       SET name = $1, period = $2, frequency = $3, specific_days = $4, times_per_week = $5,
           icon = $6, color = $7, add_to_habit_tracking = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [name, period, frequency, specific_days || null, times_per_week || null, icon || null, color, add_to_habit_tracking, is_active, id, user_id]
    );

    if (result.rows.length === 0) {
      console.log('❌ [PUT /api/routines/:id] Rotina não encontrada');
      return res.status(404).json({ error: 'Rotina não encontrada' });
    }

    const routine = result.rows[0];
    console.log('✅ [PUT /api/routines/:id] Rotina atualizada:', routine);

    // Se mudou de false para true, criar hábito
    if (!wasTrackingBefore && add_to_habit_tracking) {
      console.log('🔄 [PUT /api/routines/:id] Criando hábito (false → true)...');
      try {
        const habitResult = await pool.query(
          `INSERT INTO habits (routine_id, name, period, frequency, specific_days, times_per_week, start_date, icon, color, is_active, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, true, $9) RETURNING *`,
          [routine.id, name, period, frequency, specific_days || null, times_per_week || null, icon || null, color || '#8b5cf6', user_id]
        );
        console.log(`✅ [PUT /api/routines/:id] Hábito criado:`, habitResult.rows[0]);
      } catch (habitError) {
        console.error('❌ [PUT /api/routines/:id] Erro ao criar hábito:', habitError.message);
        console.error('❌ [PUT /api/routines/:id] Stack completo:', habitError);
      }
    }
    // Se mudou de true para false, desativar o hábito vinculado
    else if (wasTrackingBefore && !add_to_habit_tracking) {
      console.log('🔄 [PUT /api/routines/:id] Desativando hábito (true → false)...');
      try {
        await pool.query(
          `UPDATE habits SET is_active = false WHERE routine_id = $1 AND user_id = $2`,
          [routine.id, user_id]
        );
        console.log(`✅ [PUT /api/routines/:id] Hábito desativado`);
      } catch (habitError) {
        console.error('❌ [PUT /api/routines/:id] Erro ao desativar hábito:', habitError.message);
      }
    }
    // Se continua true, atualizar o hábito existente
    else if (add_to_habit_tracking) {
      console.log('🔄 [PUT /api/routines/:id] Atualizando hábito existente (true → true)...');
      try {
        const updateResult = await pool.query(
          `UPDATE habits
           SET name = $1, period = $2, frequency = $3, specific_days = $4, times_per_week = $5,
               icon = $6, color = $7, is_active = $8
           WHERE routine_id = $9 AND user_id = $10 RETURNING *`,
          [name, period, frequency, specific_days || null, times_per_week || null, icon || null, color, is_active, routine.id, user_id]
        );
        console.log(`✅ [PUT /api/routines/:id] Hábito atualizado:`, updateResult.rows[0]);
      } catch (habitError) {
        console.error('❌ [PUT /api/routines/:id] Erro ao atualizar hábito:', habitError.message);
      }
    } else {
      console.log('ℹ️ [PUT /api/routines/:id] Nenhuma ação necessária para hábitos (false → false)');
    }

    res.json(routine);
  } catch (error) {
    console.error('❌ [PUT /api/routines/:id] Erro ao atualizar rotina:', error);
    res.status(500).json({ error: 'Erro ao atualizar rotina' });
  }
});

// Excluir uma rotina
app.delete('/api/routines/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;

  try {
    const result = await pool.query('DELETE FROM routines WHERE id = $1 AND user_id = $2 RETURNING id', [id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rotina não encontrada' });
    }

    res.json({ message: 'Rotina excluída com sucesso', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao excluir rotina:', error);
    res.status(500).json({ error: 'Erro ao excluir rotina' });
  }
});

// Listar completions de rotinas (com filtro opcional por data)
app.get('/api/routine-completions', async (req, res) => {
  const { routine_id, start_date, end_date } = req.query;

  try {
    let query = 'SELECT * FROM routine_completions WHERE 1=1';
    const params = [];

    if (routine_id) {
      params.push(routine_id);
      query += ` AND routine_id = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND completion_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND completion_date <= $${params.length}`;
    }

    query += ' ORDER BY completion_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar completions:', error);
    res.status(500).json({ error: 'Erro ao buscar completions' });
  }
});

// Toggle completion de rotina (criar ou atualizar)
app.post('/api/routine-completions/toggle', authenticateToken, async (req, res) => {
  const { routine_id, completion_date } = req.body;
  const user_id = req.user.userId;

  try {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT * FROM routine_completions WHERE routine_id = $1 AND completion_date = $2 AND user_id = $3',
      [routine_id, completion_date, user_id]
    );

    let result;
    let newCompletedState;

    if (existing.rows.length > 0) {
      // Toggle o valor de completed
      result = await pool.query(
        'UPDATE routine_completions SET completed = NOT completed WHERE routine_id = $1 AND completion_date = $2 AND user_id = $3 RETURNING *',
        [routine_id, completion_date, user_id]
      );
      newCompletedState = result.rows[0].completed;
    } else {
      // Criar novo
      result = await pool.query(
        'INSERT INTO routine_completions (routine_id, completion_date, completed, user_id) VALUES ($1, $2, true, $3) RETURNING *',
        [routine_id, completion_date, user_id]
      );
      newCompletedState = true;
    }

    console.log(`✅ [Toggle Routine] routine_id=${routine_id}, date=${completion_date}, completed=${newCompletedState}`);

    // 🔗 SINCRONIZAR COM HÁBITO: Se a rotina tem hábito vinculado, sincronizar
    const habitCheck = await pool.query(
      'SELECT id FROM habits WHERE routine_id = $1 AND is_active = true',
      [routine_id]
    );

    if (habitCheck.rows.length > 0) {
      const habit_id = habitCheck.rows[0].id;
      console.log(`🔗 [Sincronizar] Rotina ${routine_id} → Hábito ${habit_id}`);

      // Verificar se já existe completion do hábito
      const habitCompletion = await pool.query(
        'SELECT * FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND user_id = $3',
        [habit_id, completion_date, user_id]
      );

      if (habitCompletion.rows.length > 0) {
        // Atualizar para o mesmo estado
        await pool.query(
          'UPDATE habit_completions SET completed = $1 WHERE habit_id = $2 AND completion_date = $3 AND user_id = $4',
          [newCompletedState, habit_id, completion_date, user_id]
        );
        console.log(`✅ [Sincronizar] Hábito ${habit_id} atualizado: ${newCompletedState}`);
      } else {
        // Criar novo completion do hábito com o mesmo estado
        await pool.query(
          'INSERT INTO habit_completions (habit_id, completion_date, completed, user_id) VALUES ($1, $2, $3, $4)',
          [habit_id, completion_date, newCompletedState, user_id]
        );
        console.log(`✅ [Sincronizar] Hábito ${habit_id} criado: ${newCompletedState}`);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao toggle completion:', error);
    res.status(500).json({ error: 'Erro ao toggle completion' });
  }
});

// Excluir um completion
app.delete('/api/routine-completions/:id', async (req, res) => {
  const { id} = req.params;

  try {
    const result = await pool.query('DELETE FROM routine_completions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Completion não encontrado' });
    }

    res.json({ message: 'Completion excluído com sucesso', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao excluir completion:', error);
    res.status(500).json({ error: 'Erro ao excluir completion' });
  }
});

// ================================
// ENDPOINTS DE HÁBITOS
// ================================

// Listar todos os hábitos
app.get('/api/habits', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar hábitos:', error);
    res.status(500).json({ error: 'Erro ao buscar hábitos' });
  }
});

// Criar um novo hábito
app.post('/api/habits', authenticateToken, async (req, res) => {
  const { routine_id, name, period, frequency, specific_days, times_per_week, start_date, end_date, icon, color } = req.body;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `INSERT INTO habits (routine_id, name, period, frequency, specific_days, times_per_week, start_date, end_date, icon, color, is_active, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11) RETURNING *`,
      [routine_id || null, name, period || null, frequency, specific_days || null, times_per_week || null, start_date, end_date || null, icon || null, color || '#8b5cf6', user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar hábito:', error);
    res.status(500).json({ error: 'Erro ao criar hábito' });
  }
});

// Atualizar um hábito
app.put('/api/habits/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { routine_id, name, period, frequency, specific_days, times_per_week, start_date, end_date, icon, color, is_active } = req.body;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `UPDATE habits
       SET routine_id = $1, name = $2, period = $3, frequency = $4, specific_days = $5,
           times_per_week = $6, start_date = $7, end_date = $8, icon = $9, color = $10,
           is_active = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND user_id = $13 RETURNING *`,
      [routine_id || null, name, period || null, frequency, specific_days || null, times_per_week || null, start_date, end_date || null, icon || null, color, is_active, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar hábito:', error);
    res.status(500).json({ error: 'Erro ao atualizar hábito' });
  }
});

// Arquivar um hábito
app.patch('/api/habits/:id/archive', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE habits SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao arquivar hábito:', error);
    res.status(500).json({ error: 'Erro ao arquivar hábito' });
  }
});

// Desarquivar um hábito
app.patch('/api/habits/:id/unarchive', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE habits SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao desarquivar hábito:', error);
    res.status(500).json({ error: 'Erro ao desarquivar hábito' });
  }
});

// Excluir um hábito
app.delete('/api/habits/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;

  try {
    const result = await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id', [id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito não encontrado' });
    }

    res.json({ message: 'Hábito excluído com sucesso', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao excluir hábito:', error);
    res.status(500).json({ error: 'Erro ao excluir hábito' });
  }
});

// Listar completions de hábitos (com filtro opcional)
app.get('/api/habit-completions', async (req, res) => {
  const { habit_id, start_date, end_date } = req.query;

  try {
    let query = 'SELECT * FROM habit_completions WHERE 1=1';
    const params = [];

    if (habit_id) {
      params.push(habit_id);
      query += ` AND habit_id = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND completion_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND completion_date <= $${params.length}`;
    }

    query += ' ORDER BY completion_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar completions de hábitos:', error);
    res.status(500).json({ error: 'Erro ao buscar completions de hábitos' });
  }
});

// Toggle completion de hábito
app.post('/api/habit-completions/toggle', authenticateToken, async (req, res) => {
  const { habit_id, completion_date } = req.body;
  const user_id = req.user.userId;

  try {
    // Verificar se já existe
    const existing = await pool.query(
      'SELECT * FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND user_id = $3',
      [habit_id, completion_date, user_id]
    );

    let result;
    let newCompletedState;

    if (existing.rows.length > 0) {
      // Toggle o valor de completed
      result = await pool.query(
        'UPDATE habit_completions SET completed = NOT completed WHERE habit_id = $1 AND completion_date = $2 AND user_id = $3 RETURNING *',
        [habit_id, completion_date, user_id]
      );
      newCompletedState = result.rows[0].completed;
    } else {
      // Criar novo
      result = await pool.query(
        'INSERT INTO habit_completions (habit_id, completion_date, completed, user_id) VALUES ($1, $2, true, $3) RETURNING *',
        [habit_id, completion_date, user_id]
      );
      newCompletedState = true;
    }

    console.log(`✅ [Toggle Habit] habit_id=${habit_id}, date=${completion_date}, completed=${newCompletedState}`);

    // 🔗 SINCRONIZAR COM ROTINA: Se o hábito tem rotina vinculada, sincronizar
    const routineCheck = await pool.query(
      'SELECT routine_id FROM habits WHERE id = $1 AND routine_id IS NOT NULL',
      [habit_id]
    );

    if (routineCheck.rows.length > 0) {
      const routine_id = routineCheck.rows[0].routine_id;
      console.log(`🔗 [Sincronizar] Hábito ${habit_id} → Rotina ${routine_id}`);

      // Verificar se já existe completion da rotina
      const routineCompletion = await pool.query(
        'SELECT * FROM routine_completions WHERE routine_id = $1 AND completion_date = $2 AND user_id = $3',
        [routine_id, completion_date, user_id]
      );

      if (routineCompletion.rows.length > 0) {
        // Atualizar para o mesmo estado
        await pool.query(
          'UPDATE routine_completions SET completed = $1 WHERE routine_id = $2 AND completion_date = $3 AND user_id = $4',
          [newCompletedState, routine_id, completion_date, user_id]
        );
        console.log(`✅ [Sincronizar] Rotina ${routine_id} atualizada: ${newCompletedState}`);
      } else {
        // Criar novo completion da rotina com o mesmo estado
        await pool.query(
          'INSERT INTO routine_completions (routine_id, completion_date, completed, user_id) VALUES ($1, $2, $3, $4)',
          [routine_id, completion_date, newCompletedState, user_id]
        );
        console.log(`✅ [Sincronizar] Rotina ${routine_id} criada: ${newCompletedState}`);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao toggle completion de hábito:', error);
    res.status(500).json({ error: 'Erro ao toggle completion de hábito' });
  }
});

// Excluir um completion de hábito
app.delete('/api/habit-completions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM habit_completions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Completion não encontrado' });
    }

    res.json({ message: 'Completion excluído com sucesso', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao excluir completion de hábito:', error);
    res.status(500).json({ error: 'Erro ao excluir completion de hábito' });
  }
});

// ================================
// ENDPOINTS DE SKINCARE
// ================================

// Listar produtos de skincare
app.get('/api/skincare', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { day_of_week, period } = req.query;

    let query = 'SELECT * FROM skincare_routines WHERE user_id = $1';
    const params = [user_id];

    if (day_of_week) {
      query += ' AND day_of_week = $2';
      params.push(day_of_week);
    }

    if (period) {
      const paramIndex = params.length + 1;
      query += ` AND period = $${paramIndex}`;
      params.push(period);
    }

    query += ' ORDER BY day_of_week, period, application_order';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar skincare:', error);
    res.status(500).json({ error: 'Erro ao buscar rotina de skincare' });
  }
});

// Criar produto de skincare
app.post('/api/skincare', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { day_of_week, period, product_name, application_order, notes } = req.body;

    if (!day_of_week || !period || !product_name) {
      return res.status(400).json({ error: 'Dia da semana, período e nome do produto são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO skincare_routines (user_id, day_of_week, period, product_name, application_order, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, day_of_week, period, product_name, application_order || 0, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto de skincare:', error);
    res.status(500).json({ error: 'Erro ao criar produto de skincare' });
  }
});

// Reordenar produtos de skincare
app.put('/api/skincare/reorder', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { orders } = req.body; // Array de { id, application_order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders deve ser um array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE skincare_routines SET application_order = $1 WHERE id = $2 AND user_id = $3',
          [item.application_order, item.id, user_id]
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
    console.error('Erro ao reordenar produtos:', error);
    res.status(500).json({ error: 'Erro ao reordenar produtos' });
  }
});

// Atualizar produto de skincare
app.put('/api/skincare/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { day_of_week, period, product_name, application_order, notes } = req.body;

    const result = await pool.query(
      `UPDATE skincare_routines
       SET day_of_week = $1, period = $2, product_name = $3, application_order = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [day_of_week, period, product_name, application_order, notes, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar produto de skincare
app.delete('/api/skincare/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM skincare_routines WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// ===== TREATMENT =====

// Upload de foto para tratamento
app.post('/api/skincare/treatment/upload', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const photoUrl = `/uploads/skincare/${req.file.filename}`;
    res.json({
      message: 'Upload realizado com sucesso',
      photo_url: photoUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

// Buscar tratamento ativo
app.get('/api/skincare/treatment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM skincare_treatments WHERE user_id = $1 AND is_active = true',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar tratamento:', error);
    res.status(500).json({ error: 'Erro ao buscar tratamento' });
  }
});

// Criar ou atualizar tratamento
app.post('/api/skincare/treatment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    let { treatment_description, goal, start_date, end_date, photo_url, photo_date } = req.body;

    // Converter strings vazias em NULL para campos de data e texto
    start_date = start_date && start_date.trim() !== '' ? start_date : null;
    end_date = end_date && end_date.trim() !== '' ? end_date : null;
    photo_date = photo_date && photo_date.trim() !== '' ? photo_date : null;
    photo_url = photo_url && photo_url.trim() !== '' ? photo_url : null;
    treatment_description = treatment_description && treatment_description.trim() !== '' ? treatment_description : null;
    goal = goal && goal.trim() !== '' ? goal : null;

    // Verificar se já existe um tratamento ativo
    const existing = await pool.query(
      'SELECT * FROM skincare_treatments WHERE user_id = $1 AND is_active = true',
      [user_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Atualizar tratamento existente
      result = await pool.query(
        `UPDATE skincare_treatments
         SET treatment_description = $1, goal = $2, start_date = $3, end_date = $4,
             photo_url = $5, photo_date = $6, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7 AND is_active = true
         RETURNING *`,
        [treatment_description, goal, start_date, end_date, photo_url, photo_date, user_id]
      );
    } else {
      // Criar novo tratamento
      result = await pool.query(
        `INSERT INTO skincare_treatments
         (user_id, treatment_description, goal, start_date, end_date, photo_url, photo_date, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [user_id, treatment_description, goal, start_date, end_date, photo_url, photo_date]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar tratamento:', error);
    res.status(500).json({ error: 'Erro ao salvar tratamento' });
  }
});

// Deletar tratamento
app.delete('/api/skincare/treatment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM skincare_treatments WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tratamento não encontrado' });
    }

    res.json({ message: 'Tratamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tratamento:', error);
    res.status(500).json({ error: 'Erro ao deletar tratamento' });
  }
});

// ===== COMPLETIONS =====

// Buscar completions de produtos de skincare
app.get('/api/skincare/completions', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { date } = req.query;

    let query = 'SELECT * FROM skincare_completions WHERE user_id = $1';
    const params = [user_id];

    if (date) {
      query += ' AND completion_date = $2';
      params.push(date);
    }

    query += ' ORDER BY completion_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar completions:', error);
    res.status(500).json({ error: 'Erro ao buscar completions' });
  }
});

// Toggle completion de produto de skincare
app.post('/api/skincare/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { date, completed } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    // Verificar se o produto pertence ao usuário
    const productCheck = await pool.query(
      'SELECT * FROM skincare_routines WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Upsert do completion
    const result = await pool.query(
      `INSERT INTO skincare_completions (user_id, product_id, completion_date, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id, completion_date)
       DO UPDATE SET completed = EXCLUDED.completed, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, id, date, completed]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao toggle completion:', error);
    res.status(500).json({ error: 'Erro ao atualizar completion' });
  }
});

// ================================
// ENDPOINTS DE RECEITAS (PRESCRIPTIONS)
// ================================

// Listar receitas do usuário com seus itens e fotos
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const prescriptions = await pool.query(
      'SELECT * FROM prescriptions WHERE user_id = $1 ORDER BY prescription_date DESC, created_at DESC',
      [user_id]
    );

    // Para cada receita, buscar seus itens e fotos
    const prescriptionsWithItemsAndPhotos = await Promise.all(
      prescriptions.rows.map(async (prescription) => {
        const items = await pool.query(
          'SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY id',
          [prescription.id]
        );
        const photos = await pool.query(
          'SELECT * FROM prescription_photos WHERE prescription_id = $1 ORDER BY created_at',
          [prescription.id]
        );
        return {
          ...prescription,
          items: items.rows,
          photos: photos.rows
        };
      })
    );

    res.json(prescriptionsWithItemsAndPhotos);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

// Criar nova receita com itens
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.userId;
    let { prescription_date, doctor_name, doctor_crm, doctor_specialty, notes, rating, items, photo_urls } = req.body;

    // Converter strings vazias em NULL
    prescription_date = prescription_date && prescription_date.trim() !== '' ? prescription_date : null;
    doctor_name = doctor_name && doctor_name.trim() !== '' ? doctor_name : null;
    doctor_crm = doctor_crm && doctor_crm.trim() !== '' ? doctor_crm : null;
    doctor_specialty = doctor_specialty && doctor_specialty.trim() !== '' ? doctor_specialty : null;
    notes = notes && notes.trim() !== '' ? notes : null;
    rating = rating !== undefined && rating !== null && rating !== '' ? parseInt(rating) : null;

    if (!prescription_date) {
      return res.status(400).json({ error: 'Data da receita é obrigatória' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Adicione pelo menos um remédio' });
    }

    if (rating !== null && (rating < 0 || rating > 10)) {
      return res.status(400).json({ error: 'Rating deve ser entre 0 e 10' });
    }

    await client.query('BEGIN');

    // Inserir receita
    const prescriptionResult = await client.query(
      `INSERT INTO prescriptions (user_id, prescription_date, doctor_name, doctor_crm, doctor_specialty, notes, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, prescription_date, doctor_name, doctor_crm, doctor_specialty, notes, rating]
    );

    const prescription = prescriptionResult.rows[0];

    // Inserir itens
    const itemsInserted = [];
    for (const item of items) {
      let medicine_name = item.medicine_name && item.medicine_name.trim() !== '' ? item.medicine_name : null;
      let dosage = item.dosage && item.dosage.trim() !== '' ? item.dosage : null;
      let quantity = item.quantity && item.quantity.trim() !== '' ? item.quantity : null;
      let instructions = item.instructions && item.instructions.trim() !== '' ? item.instructions : null;

      if (!medicine_name) continue; // Pular itens sem nome

      const itemResult = await client.query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, quantity, instructions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [prescription.id, medicine_name, dosage, quantity, instructions]
      );
      itemsInserted.push(itemResult.rows[0]);
    }

    // Inserir fotos se houver
    const photosInserted = [];
    if (photo_urls && Array.isArray(photo_urls)) {
      for (const photo_url of photo_urls) {
        if (photo_url && photo_url.trim() !== '') {
          const photoResult = await client.query(
            `INSERT INTO prescription_photos (prescription_id, photo_url)
             VALUES ($1, $2)
             RETURNING *`,
            [prescription.id, photo_url.trim()]
          );
          photosInserted.push(photoResult.rows[0]);
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      ...prescription,
      items: itemsInserted,
      photos: photosInserted
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar receita:', error);
    res.status(500).json({ error: 'Erro ao criar receita' });
  } finally {
    client.release();
  }
});

// Atualizar receita e seus itens
app.put('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    let { prescription_date, doctor_name, doctor_crm, doctor_specialty, notes, rating, items, photo_urls } = req.body;

    // Converter strings vazias em NULL
    prescription_date = prescription_date && prescription_date.trim() !== '' ? prescription_date : null;
    doctor_name = doctor_name && doctor_name.trim() !== '' ? doctor_name : null;
    doctor_crm = doctor_crm && doctor_crm.trim() !== '' ? doctor_crm : null;
    doctor_specialty = doctor_specialty && doctor_specialty.trim() !== '' ? doctor_specialty : null;
    notes = notes && notes.trim() !== '' ? notes : null;
    rating = rating !== undefined && rating !== null && rating !== '' ? parseInt(rating) : null;

    if (!prescription_date) {
      return res.status(400).json({ error: 'Data da receita é obrigatória' });
    }

    if (rating !== null && (rating < 0 || rating > 10)) {
      return res.status(400).json({ error: 'Rating deve ser entre 0 e 10' });
    }

    await client.query('BEGIN');

    // Atualizar receita
    const prescriptionResult = await client.query(
      `UPDATE prescriptions
       SET prescription_date = $1, doctor_name = $2, doctor_crm = $3, doctor_specialty = $4,
           notes = $5, rating = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [prescription_date, doctor_name, doctor_crm, doctor_specialty, notes, rating, id, user_id]
    );

    if (prescriptionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    const prescription = prescriptionResult.rows[0];

    // Deletar itens antigos
    await client.query('DELETE FROM prescription_items WHERE prescription_id = $1', [id]);

    // Inserir novos itens
    const itemsInserted = [];
    if (items && items.length > 0) {
      for (const item of items) {
        let medicine_name = item.medicine_name && item.medicine_name.trim() !== '' ? item.medicine_name : null;
        let dosage = item.dosage && item.dosage.trim() !== '' ? item.dosage : null;
        let quantity = item.quantity && item.quantity.trim() !== '' ? item.quantity : null;
        let instructions = item.instructions && item.instructions.trim() !== '' ? item.instructions : null;

        if (!medicine_name) continue;

        const itemResult = await client.query(
          `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, quantity, instructions)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [prescription.id, medicine_name, dosage, quantity, instructions]
        );
        itemsInserted.push(itemResult.rows[0]);
      }
    }

    // Deletar fotos antigas
    await client.query('DELETE FROM prescription_photos WHERE prescription_id = $1', [id]);

    // Inserir novas fotos
    const photosInserted = [];
    if (photo_urls && Array.isArray(photo_urls)) {
      for (const photo_url of photo_urls) {
        if (photo_url && photo_url.trim() !== '') {
          const photoResult = await client.query(
            `INSERT INTO prescription_photos (prescription_id, photo_url)
             VALUES ($1, $2)
             RETURNING *`,
            [prescription.id, photo_url.trim()]
          );
          photosInserted.push(photoResult.rows[0]);
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      ...prescription,
      items: itemsInserted,
      photos: photosInserted
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar receita:', error);
    res.status(500).json({ error: 'Erro ao atualizar receita' });
  } finally {
    client.release();
  }
});

// Deletar receita (cascade deleta os itens e fotos automaticamente)
app.delete('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM prescriptions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    res.json({ message: 'Receita deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

// Deletar foto individual de uma receita
app.delete('/api/prescriptions/:id/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const user_id = req.user.userId;

    // Verificar se a receita pertence ao usuário
    const prescription = await pool.query(
      'SELECT id FROM prescriptions WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (prescription.rows.length === 0) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    // Deletar a foto
    const result = await pool.query(
      'DELETE FROM prescription_photos WHERE id = $1 AND prescription_id = $2 RETURNING *',
      [photoId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    res.json({ message: 'Foto deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto' });
  }
});

// Upload de foto para receita
app.post('/api/prescriptions/upload', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const photoUrl = `/uploads/skincare/${req.file.filename}`;
    res.json({
      message: 'Upload realizado com sucesso',
      photo_url: photoUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

// ================================
// ENDPOINTS DE CONSULTAS (APPOINTMENTS)
// ================================

// Listar todas as consultas
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_date DESC, appointment_time DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ error: 'Erro ao buscar consultas' });
  }
});

// Criar nova consulta
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { patient_type, dependent_id, appointment_date, appointment_time, doctor_name, specialty, appointment_type, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointments
       (user_id, patient_type, dependent_id, appointment_date, appointment_time, doctor_name, specialty, appointment_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.userId, patient_type, dependent_id || null, appointment_date, appointment_time, doctor_name, specialty, appointment_type, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    res.status(500).json({ error: 'Erro ao criar consulta' });
  }
});

// Atualizar consulta
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { patient_type, dependent_id, appointment_date, appointment_time, doctor_name, specialty, appointment_type, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE appointments
       SET patient_type = $1, dependent_id = $2, appointment_date = $3, appointment_time = $4, doctor_name = $5,
           specialty = $6, appointment_type = $7, notes = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [patient_type, dependent_id || null, appointment_date, appointment_time, doctor_name, specialty, appointment_type, notes, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    res.status(500).json({ error: 'Erro ao atualizar consulta' });
  }
});

// Deletar consulta
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    res.json({ message: 'Consulta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({ error: 'Erro ao deletar consulta' });
  }
});

// ================================
// ENDPOINTS DE DEPENDENTES
// ================================

// Listar todos os dependentes
app.get('/api/dependents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dependents WHERE user_id = $1 ORDER BY name ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dependentes:', error);
    res.status(500).json({ error: 'Erro ao buscar dependentes' });
  }
});

// Criar novo dependente
app.post('/api/dependents', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome do dependente é obrigatório' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO dependents (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.userId, name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar dependente:', error);
    res.status(500).json({ error: 'Erro ao criar dependente' });
  }
});

// Atualizar dependente
app.put('/api/dependents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome do dependente é obrigatório' });
  }

  try {
    const result = await pool.query(
      'UPDATE dependents SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [name.trim(), id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar dependente:', error);
    res.status(500).json({ error: 'Erro ao atualizar dependente' });
  }
});

// Deletar dependente
app.delete('/api/dependents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se existem consultas vinculadas a este dependente
    const appointmentsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE dependent_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (parseInt(appointmentsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir este dependente pois existem consultas vinculadas a ele'
      });
    }

    const result = await pool.query(
      'DELETE FROM dependents WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependente não encontrado' });
    }

    res.json({ message: 'Dependente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar dependente:', error);
    res.status(500).json({ error: 'Erro ao deletar dependente' });
  }
});

// ================================
// ENDPOINTS DE DIÁRIO
// ================================

// Listar categorias do diário
app.get('/api/diary/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM diary_categories WHERE user_id = $1 ORDER BY name ASC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias do diário:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Listar entradas do diário com filtros
app.get('/api/diary/entries', authenticateToken, async (req, res) => {
  const { month, year, week_start, week_end, search } = req.query;

  try {
    let query = `
      SELECT
        de.*,
        COALESCE(
          json_agg(
            json_build_object('id', dc.id, 'name', dc.name, 'color', dc.color)
          ) FILTER (WHERE dc.id IS NOT NULL),
          '[]'
        ) as categories
      FROM diary_entries de
      LEFT JOIN diary_entry_categories dec ON de.id = dec.entry_id
      LEFT JOIN diary_categories dc ON dec.category_id = dc.id
      WHERE de.user_id = $1
    `;
    const params = [req.user.userId];

    // Filtro por mês/ano
    if (month && year) {
      params.push(parseInt(year), parseInt(month));
      query += ` AND EXTRACT(YEAR FROM de.entry_date) = $${params.length - 1}
                 AND EXTRACT(MONTH FROM de.entry_date) = $${params.length}`;
    }

    // Filtro por semana
    if (week_start && week_end) {
      params.push(week_start, week_end);
      query += ` AND de.entry_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    // Filtro por palavra-chave
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (de.title ILIKE $${params.length} OR de.content ILIKE $${params.length})`;
    }

    query += ' GROUP BY de.id ORDER BY de.entry_date DESC, de.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar entradas do diário:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas' });
  }
});

// Buscar entrada específica
app.get('/api/diary/entries/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        de.*,
        COALESCE(
          json_agg(
            json_build_object('id', dc.id, 'name', dc.name, 'color', dc.color)
          ) FILTER (WHERE dc.id IS NOT NULL),
          '[]'
        ) as categories
      FROM diary_entries de
      LEFT JOIN diary_entry_categories dec ON de.id = dec.entry_id
      LEFT JOIN diary_categories dc ON dec.category_id = dc.id
      WHERE de.id = $1 AND de.user_id = $2
      GROUP BY de.id`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar entrada:', error);
    res.status(500).json({ error: 'Erro ao buscar entrada' });
  }
});

// Criar nova entrada
app.post('/api/diary/entries', authenticateToken, async (req, res) => {
  const { entry_date, title, content, category_ids } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Inserir entrada
    const entryResult = await client.query(
      `INSERT INTO diary_entries (user_id, entry_date, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, entry_date, title, content]
    );

    const entry = entryResult.rows[0];

    // Inserir categorias se fornecidas
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO diary_entry_categories (entry_id, category_id) VALUES ($1, $2)',
          [entry.id, categoryId]
        );
      }
    }

    await client.query('COMMIT');

    // Buscar entrada completa com categorias
    const completeEntry = await pool.query(
      `SELECT
        de.*,
        COALESCE(
          json_agg(
            json_build_object('id', dc.id, 'name', dc.name, 'color', dc.color)
          ) FILTER (WHERE dc.id IS NOT NULL),
          '[]'
        ) as categories
      FROM diary_entries de
      LEFT JOIN diary_entry_categories dec ON de.id = dec.entry_id
      LEFT JOIN diary_categories dc ON dec.category_id = dc.id
      WHERE de.id = $1
      GROUP BY de.id`,
      [entry.id]
    );

    res.status(201).json(completeEntry.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar entrada:', error);
    res.status(500).json({ error: 'Erro ao criar entrada' });
  } finally {
    client.release();
  }
});

// Atualizar entrada
app.put('/api/diary/entries/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { entry_date, title, content, category_ids } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atualizar entrada
    const entryResult = await client.query(
      `UPDATE diary_entries
       SET entry_date = $1, title = $2, content = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [entry_date, title, content, id, req.user.userId]
    );

    if (entryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    // Remover categorias antigas
    await client.query('DELETE FROM diary_entry_categories WHERE entry_id = $1', [id]);

    // Inserir novas categorias
    if (category_ids && category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO diary_entry_categories (entry_id, category_id) VALUES ($1, $2)',
          [id, categoryId]
        );
      }
    }

    await client.query('COMMIT');

    // Buscar entrada completa com categorias
    const completeEntry = await pool.query(
      `SELECT
        de.*,
        COALESCE(
          json_agg(
            json_build_object('id', dc.id, 'name', dc.name, 'color', dc.color)
          ) FILTER (WHERE dc.id IS NOT NULL),
          '[]'
        ) as categories
      FROM diary_entries de
      LEFT JOIN diary_entry_categories dec ON de.id = dec.entry_id
      LEFT JOIN diary_categories dc ON dec.category_id = dc.id
      WHERE de.id = $1
      GROUP BY de.id`,
      [id]
    );

    res.json(completeEntry.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar entrada:', error);
    res.status(500).json({ error: 'Erro ao atualizar entrada' });
  } finally {
    client.release();
  }
});

// Deletar entrada
app.delete('/api/diary/entries/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM diary_entries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    res.json({ message: 'Entrada deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar entrada:', error);
    res.status(500).json({ error: 'Erro ao deletar entrada' });
  }
});

// ================================
// ENDPOINTS DE HUMOR (MOOD)
// ================================

// Listar todos os registros de humor
app.get('/api/moods', authenticateToken, async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    let query = 'SELECT * FROM daily_moods WHERE user_id = $1';
    const params = [req.user.userId];

    if (start_date) {
      params.push(start_date);
      query += ` AND mood_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND mood_date <= $${params.length}`;
    }

    query += ' ORDER BY mood_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar registros de humor:', error);
    res.status(500).json({ error: 'Erro ao buscar registros de humor' });
  }
});

// Buscar humor por data específica
app.get('/api/moods/:date', authenticateToken, async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM daily_moods WHERE mood_date = $1 AND user_id = $2',
      [date, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado para esta data' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar humor:', error);
    res.status(500).json({ error: 'Erro ao buscar humor' });
  }
});

// Criar ou atualizar humor (upsert)
app.post('/api/moods', authenticateToken, async (req, res) => {
  const { mood_date, emotion_ids, day_rating, notes } = req.body;

  try {
    // Tentar inserir, se existir, atualizar
    const result = await pool.query(
      `INSERT INTO daily_moods (user_id, mood_date, emotion_ids, day_rating, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, mood_date)
       DO UPDATE SET
         emotion_ids = EXCLUDED.emotion_ids,
         day_rating = EXCLUDED.day_rating,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, mood_date, emotion_ids || [], day_rating || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar humor:', error);
    res.status(500).json({ error: 'Erro ao salvar humor' });
  }
});

// Atualizar humor
app.put('/api/moods/:date', authenticateToken, async (req, res) => {
  const { date } = req.params;
  const { emotion_ids, day_rating, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE daily_moods
       SET emotion_ids = $1, day_rating = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE mood_date = $4 AND user_id = $5 RETURNING *`,
      [emotion_ids || [], day_rating || null, notes || null, date, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar humor:', error);
    res.status(500).json({ error: 'Erro ao atualizar humor' });
  }
});

// Excluir humor
app.delete('/api/moods/:date', authenticateToken, async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM daily_moods WHERE mood_date = $1 AND user_id = $2 RETURNING mood_date',
      [date, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso', date: result.rows[0].mood_date });
  } catch (error) {
    console.error('Erro ao excluir humor:', error);
    res.status(500).json({ error: 'Erro ao excluir humor' });
  }
});

app.get('/api/cycle-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cycle_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configurações do ciclo:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

app.post('/api/cycle-settings', async (req, res) => {
  const { last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM cycle_settings LIMIT 1');

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE cycle_settings SET
          last_period_start_date = $1,
          average_cycle_length = $2,
          average_period_length = $3,
          luteal_phase_length = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *`,
        [last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length, existing.rows[0].id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        `INSERT INTO cycle_settings (last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Erro ao salvar configurações do ciclo:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

app.get('/api/cycle-records', async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    let query = 'SELECT * FROM cycle_records';
    const params = [];

    if (start_date && end_date) {
      query += ' WHERE record_date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ' WHERE record_date >= $1';
      params.push(start_date);
    } else if (end_date) {
      query += ' WHERE record_date <= $1';
      params.push(end_date);
    }

    query += ' ORDER BY record_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar registros do ciclo:', error);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

app.get('/api/cycle-records/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM cycle_records WHERE record_date = $1',
      [date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({ error: 'Erro ao buscar registro' });
  }
});

app.post('/api/cycle-records', async (req, res) => {
  const { record_date, flow_level, symptoms, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cycle_records (record_date, flow_level, symptoms, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (record_date) DO UPDATE SET
         flow_level = EXCLUDED.flow_level,
         symptoms = EXCLUDED.symptoms,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [record_date, flow_level || 'none', symptoms || [], notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar registro do ciclo:', error);
    res.status(500).json({ error: 'Erro ao criar registro' });
  }
});

app.put('/api/cycle-records/:date', async (req, res) => {
  const { date } = req.params;
  const { flow_level, symptoms, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cycle_records SET
         flow_level = $1,
         symptoms = $2,
         notes = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE record_date = $4 RETURNING *`,
      [flow_level || 'none', symptoms || [], notes || null, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

app.delete('/api/cycle-records/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cycle_records WHERE record_date = $1 RETURNING record_date',
      [date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso', date: result.rows[0].record_date });
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});

app.get('/api/cycle-stats', async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM cycle_settings LIMIT 1');

    if (settings.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const config = settings.rows[0];
    const lastPeriodDate = new Date(config.last_period_start_date);
    const today = new Date();

    const daysSinceLastPeriod = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    const currentCycleDay = (daysSinceLastPeriod % config.average_cycle_length) + 1;
    const daysUntilNextPeriod = config.average_cycle_length - (daysSinceLastPeriod % config.average_cycle_length);

    const ovulationDay = config.average_cycle_length - config.luteal_phase_length;
    const fertileWindowStart = ovulationDay - 5;
    const fertileWindowEnd = ovulationDay + 1;
    const pmsStart = config.average_cycle_length - 7;

    const recentRecords = await pool.query(
      `SELECT * FROM cycle_records
       WHERE record_date >= $1
       ORDER BY record_date DESC`,
      [new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]]
    );

    const symptomsCount = {};
    recentRecords.rows.forEach(record => {
      if (record.symptoms) {
        record.symptoms.forEach(symptom => {
          symptomsCount[symptom] = (symptomsCount[symptom] || 0) + 1;
        });
      }
    });

    const topSymptoms = Object.entries(symptomsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);

    const cyclesData = await pool.query(
      `SELECT record_date, flow_level FROM cycle_records
       WHERE flow_level != 'none'
       ORDER BY record_date DESC
       LIMIT 180`
    );

    const cycles = [];
    let currentCycle = [];

    cyclesData.rows.forEach(record => {
      if (currentCycle.length === 0 ||
          (new Date(currentCycle[currentCycle.length - 1].record_date) - new Date(record.record_date)) / (1000 * 60 * 60 * 24) <= 10) {
        currentCycle.push(record);
      } else {
        if (currentCycle.length > 0) cycles.push(currentCycle);
        currentCycle = [record];
      }
    });
    if (currentCycle.length > 0) cycles.push(currentCycle);

    const cycleLengths = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const startDate1 = new Date(cycles[i][cycles[i].length - 1].record_date);
      const startDate2 = new Date(cycles[i + 1][cycles[i + 1].length - 1].record_date);
      const length = Math.floor((startDate1 - startDate2) / (1000 * 60 * 60 * 24));
      if (length > 15 && length < 45) cycleLengths.push(length);
    }

    const variance = cycleLengths.length > 1 ?
      Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;
    const isRegular = variance <= 7;

    res.json({
      currentCycleDay,
      daysUntilNextPeriod,
      ovulationDay,
      fertileWindowStart,
      fertileWindowEnd,
      pmsStart,
      topSymptoms,
      isRegular,
      variance,
      averagePeriodLength: config.average_period_length,
      averageCycleLength: config.average_cycle_length,
      lastPeriodStartDate: config.last_period_start_date,
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

// ==================== CALENDAR EVENTS ====================

// GET /api/calendar-events - Buscar eventos (com filtro opcional por intervalo de datas)
app.get('/api/calendar-events', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM calendar_events';
    const params = [];

    if (start_date && end_date) {
      query += ' WHERE event_date >= $1 AND event_date <= $2';
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ' WHERE event_date >= $1';
      params.push(start_date);
    } else if (end_date) {
      query += ' WHERE event_date <= $1';
      params.push(end_date);
    }

    query += ' ORDER BY event_date ASC, event_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// POST /api/calendar-events - Criar novo evento
app.post('/api/calendar-events', async (req, res) => {
  try {
    const { event_date, event_time, description } = req.body;

    if (!event_date || !event_time || !description) {
      return res.status(400).json({ error: 'Data, hora e descrição são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO calendar_events (event_date, event_time, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [event_date, event_time, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// DELETE /api/calendar-events/:id - Deletar evento
app.delete('/api/calendar-events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM calendar_events WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

// ==================== TODO LISTS ====================

// GET /api/todo-lists - Buscar todas as listas de tarefas com seus itens
app.get('/api/todo-lists', async (req, res) => {
  try {
    const listsResult = await pool.query(
      'SELECT * FROM todo_lists ORDER BY display_order ASC, id ASC'
    );

    const lists = await Promise.all(
      listsResult.rows.map(async (list) => {
        const itemsResult = await pool.query(
          'SELECT * FROM todo_list_items WHERE list_id = $1 ORDER BY display_order ASC, id ASC',
          [list.id]
        );
        return {
          ...list,
          items: itemsResult.rows,
        };
      })
    );

    res.json(lists);
  } catch (error) {
    console.error('Erro ao buscar listas de tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar listas de tarefas' });
  }
});

// POST /api/todo-lists - Criar nova lista de tarefas
app.post('/api/todo-lists', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user_id = req.user.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da lista é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO todo_lists (name, user_id) VALUES ($1, $2) RETURNING *',
      [name.trim(), user_id]
    );

    res.status(201).json({ ...result.rows[0], items: [] });
  } catch (error) {
    console.error('Erro ao criar lista de tarefas:', error);
    res.status(500).json({ error: 'Erro ao criar lista de tarefas' });
  }
});

// PUT /api/todo-lists/reorder - Reordenar listas (DEVE VIR ANTES DE /:id)
app.put('/api/todo-lists/reorder', authenticateToken, async (req, res) => {
  try {
    const { orders } = req.body; // Array de { id, display_order }
    const user_id = req.user.userId;

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders deve ser um array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        await client.query(
          'UPDATE todo_lists SET display_order = $1 WHERE id = $2 AND user_id = $3',
          [item.display_order, item.id, user_id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Ordem das listas atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao reordenar listas:', error);
    res.status(500).json({ error: 'Erro ao reordenar listas' });
  }
});

// PUT /api/todo-lists/:id - Atualizar nome da lista
app.put('/api/todo-lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da lista é obrigatório' });
    }

    const result = await pool.query(
      'UPDATE todo_lists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [name.trim(), id, user_id]
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

// DELETE /api/todo-lists/:id - Deletar lista
app.delete('/api/todo-lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM todo_lists WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }

    res.json({ message: 'Lista deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lista:', error);
    res.status(500).json({ error: 'Erro ao deletar lista' });
  }
});

// POST /api/todo-lists/:id/items - Adicionar item à lista
app.post('/api/todo-lists/:id/items', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome do item é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO todo_list_items (list_id, name, user_id) VALUES ($1, $2, $3) RETURNING *',
      [id, name.trim(), user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// PUT /api/todo-list-items/reorder - Reordenar itens (DEVE VIR ANTES DE /:id)
app.put('/api/todo-list-items/reorder', authenticateToken, async (req, res) => {
  try {
    const { orders } = req.body; // Array de { id, display_order }
    const user_id = req.user.userId;

    console.log('📋 [Reorder Items] Recebido orders:', orders);
    console.log('📋 [Reorder Items] user_id:', user_id);

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders deve ser um array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of orders) {
        console.log(`📋 [Reorder Items] Atualizando item ${item.id} para display_order ${item.display_order}`);
        const result = await client.query(
          'UPDATE todo_list_items SET display_order = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
          [item.display_order, item.id, user_id]
        );
        console.log(`📋 [Reorder Items] Resultado:`, result.rows.length, 'linhas afetadas');
      }

      await client.query('COMMIT');
      console.log('✅ [Reorder Items] Sucesso!');
      res.json({ message: 'Ordem dos itens atualizada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao reordenar itens:', error);
    res.status(500).json({ error: 'Erro ao reordenar itens' });
  }
});

// PUT /api/todo-list-items/:id - Atualizar item
app.put('/api/todo-list-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { name, checked } = req.body;

    console.log('📝 [Update Item] id:', id, 'user_id:', user_id);
    console.log('📝 [Update Item] Body:', { name, checked });

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json({ error: 'Nome do item não pode estar vazio' });
      }
      updates.push(`name = $${paramCounter}`);
      values.push(name.trim());
      paramCounter++;
    }

    if (checked !== undefined) {
      updates.push(`checked = $${paramCounter}`);
      values.push(checked ? 1 : 0);
      paramCounter++;
    }

    if (updates.length === 0) {
      console.log('❌ [Update Item] Nenhum campo para atualizar');
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    values.push(user_id);

    console.log('📝 [Update Item] Updates:', updates);
    console.log('📝 [Update Item] Values:', values);

    const result = await pool.query(
      `UPDATE todo_list_items SET ${updates.join(', ')} WHERE id = $${paramCounter} AND user_id = $${paramCounter + 1} RETURNING *`,
      values
    );

    console.log('📝 [Update Item] Resultado:', result.rows.length, 'linhas afetadas');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    console.log('✅ [Update Item] Sucesso!');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// DELETE /api/todo-list-items/:id - Deletar item
app.delete('/api/todo-list-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM todo_list_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Item deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
});

// ================================
// ENDPOINTS DE DOCUMENTOS
// ================================

// Listar categorias de documentos
app.get('/api/document-categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM document_categories ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar nova categoria
app.post('/api/document-categories', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    // Buscar o próximo display_order
    const maxOrderResult = await pool.query(
      'SELECT MAX(display_order) as max_order FROM document_categories'
    );
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const result = await pool.query(
      `INSERT INTO document_categories (name, description, icon, color, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, icon, color, nextOrder]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// Atualizar categoria
app.put('/api/document-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const result = await pool.query(
      `UPDATE document_categories
       SET name = COALESCE($1, name),
           description = $2,
           color = COALESCE($3, color)
       WHERE id = $4
       RETURNING *`,
      [name, description || null, color, id]
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

// Excluir categoria
app.delete('/api/document-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há documentos nesta categoria
    const docsResult = await pool.query(
      'SELECT COUNT(*) as count FROM documents WHERE category_id = $1',
      [id]
    );

    if (parseInt(docsResult.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir categoria com documentos. Mova ou exclua os documentos primeiro.'
      });
    }

    const result = await pool.query(
      'DELETE FROM document_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});

// Listar documentos (com filtro opcional por categoria)
app.get('/api/documents', async (req, res) => {
  try {
    const { category_id, search } = req.query;

    let query = `
      SELECT d.*, dc.name as category_name, dc.color as category_color, dc.icon as category_icon
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
    `;

    const conditions = [];
    const values = [];
    let paramCounter = 1;

    if (category_id) {
      conditions.push(`d.category_id = $${paramCounter}`);
      values.push(category_id);
      paramCounter++;
    }

    if (search) {
      conditions.push(`(d.name ILIKE $${paramCounter} OR d.description ILIKE $${paramCounter} OR $${paramCounter} = ANY(d.tags))`);
      values.push(`%${search}%`);
      paramCounter++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, values);

    // Não enviar file_data na listagem (apenas metadados)
    const documents = result.rows.map(doc => ({
      ...doc,
      file_data: undefined, // Remove para economizar banda
      has_file: !!doc.file_data
    }));

    res.json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// Obter um documento específico (com file_data)
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT d.*, dc.name as category_name, dc.color as category_color
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ error: 'Erro ao buscar documento' });
  }
});

// Criar novo documento
app.post('/api/documents', async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      file_name,
      file_type,
      file_size,
      file_data,
      tags
    } = req.body;

    if (!name || !file_name || !file_type || !file_data) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, file_name, file_type, file_data' });
    }

    const result = await pool.query(
      `INSERT INTO documents (category_id, name, description, file_name, file_type, file_size, file_data, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        category_id || null,
        name,
        description || null,
        file_name,
        file_type,
        file_size || null,
        file_data,
        tags || []
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ error: 'Erro ao criar documento' });
  }
});

// Atualizar documento
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      tags
    } = req.body;

    const result = await pool.query(
      `UPDATE documents
       SET category_id = $1, name = $2, description = $3, tags = $4
       WHERE id = $5
       RETURNING *`,
      [category_id || null, name, description, tags || [], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({ error: 'Erro ao atualizar documento' });
  }
});

// Excluir documento
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ error: 'Erro ao excluir documento' });
  }
});

// ================================
// ENDPOINTS DE DATAS IMPORTANTES
// ================================

// Listar categorias de datas importantes
app.get('/api/important-dates-categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM important_dates_categories ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Listar datas importantes (com filtros opcionais)
app.get('/api/important-dates', async (req, res) => {
  try {
    const { year, category_id, search } = req.query;

    let query = 'SELECT * FROM important_dates_with_tags WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (year) {
      query += ` AND year = $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }

    if (category_id) {
      query += ` AND id IN (
        SELECT important_date_id
        FROM important_dates_tags
        WHERE category_id = $${paramIndex}
      )`;
      params.push(parseInt(category_id));
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar datas importantes:', error);
    res.status(500).json({ error: 'Erro ao buscar datas importantes' });
  }
});

// Buscar uma data importante específica
app.get('/api/important-dates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM important_dates_with_tags WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data importante não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar data importante:', error);
    res.status(500).json({ error: 'Erro ao buscar data importante' });
  }
});

// Criar nova data importante
app.post('/api/important-dates', async (req, res) => {
  const client = await pool.connect();

  try {
    const { date, title, description, link, tags } = req.body;

    if (!date || !title) {
      return res.status(400).json({ error: 'Campos obrigatórios: date, title' });
    }

    await client.query('BEGIN');

    // Inserir data importante
    const result = await client.query(
      `INSERT INTO important_dates (date, title, description, link)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [date, title, description || null, link || null]
    );

    const importantDateId = result.rows[0].id;

    // Inserir tags (se fornecidas)
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const categoryId of tags) {
        await client.query(
          `INSERT INTO important_dates_tags (important_date_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [importantDateId, categoryId]
        );
      }
    }

    await client.query('COMMIT');

    // Buscar resultado completo com tags
    const finalResult = await pool.query(
      'SELECT * FROM important_dates_with_tags WHERE id = $1',
      [importantDateId]
    );

    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar data importante:', error);
    res.status(500).json({ error: 'Erro ao criar data importante' });
  } finally {
    client.release();
  }
});

// Atualizar data importante
app.put('/api/important-dates/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { date, title, description, link, tags } = req.body;

    await client.query('BEGIN');

    // Atualizar dados básicos
    const result = await client.query(
      `UPDATE important_dates
       SET date = COALESCE($1, date),
           title = COALESCE($2, title),
           description = $3,
           link = $4
       WHERE id = $5
       RETURNING *`,
      [date, title, description, link, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Data importante não encontrada' });
    }

    // Atualizar tags (se fornecidas)
    if (tags !== undefined) {
      // Remover tags antigas
      await client.query(
        'DELETE FROM important_dates_tags WHERE important_date_id = $1',
        [id]
      );

      // Inserir novas tags
      if (Array.isArray(tags) && tags.length > 0) {
        for (const categoryId of tags) {
          await client.query(
            `INSERT INTO important_dates_tags (important_date_id, category_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [id, categoryId]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Buscar resultado completo com tags
    const finalResult = await pool.query(
      'SELECT * FROM important_dates_with_tags WHERE id = $1',
      [id]
    );

    res.json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar data importante:', error);
    res.status(500).json({ error: 'Erro ao atualizar data importante' });
  } finally {
    client.release();
  }
});

// Excluir data importante
app.delete('/api/important-dates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM important_dates WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data importante não encontrada' });
    }

    res.json({ message: 'Data importante excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir data importante:', error);
    res.status(500).json({ error: 'Erro ao excluir data importante' });
  }
});

// Buscar anos disponíveis (para filtro)
app.get('/api/important-dates-years', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT year FROM important_dates ORDER BY year DESC'
    );
    res.json(result.rows.map(row => row.year));
  } catch (error) {
    console.error('Erro ao buscar anos:', error);
    res.status(500).json({ error: 'Erro ao buscar anos' });
  }
});

// ================================
// ENDPOINTS DE ASSINATURAS
// ================================

// Listar todas as assinaturas
app.get('/api/subscriptions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions ORDER BY next_charge_date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    res.status(500).json({ error: 'Erro ao buscar assinaturas' });
  }
});

// Buscar uma assinatura específica
app.get('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

// Calcular resumo de assinaturas com separação por periodicidade
app.get('/api/subscriptions/summary/total', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        -- Gasto mensal fixo (apenas mensais)
        COALESCE(SUM(amount) FILTER (WHERE period = 'mensal' AND active = true), 0) as monthly_fixed,

        -- Gasto médio mensal (todas convertidas)
        COALESCE(SUM(
          CASE
            WHEN period = 'mensal' THEN amount
            WHEN period = 'trimestral' THEN amount / 3
            WHEN period = 'anual' THEN amount / 12
          END
        ) FILTER (WHERE active = true), 0) as monthly_average,

        -- Gasto anual total
        COALESCE(SUM(
          CASE
            WHEN period = 'mensal' THEN amount * 12
            WHEN period = 'trimestral' THEN amount * 4
            WHEN period = 'anual' THEN amount
          END
        ) FILTER (WHERE active = true), 0) as yearly_total,

        -- Breakdown por periodicidade
        COALESCE(SUM(amount) FILTER (WHERE period = 'mensal' AND active = true), 0) as monthly_total,
        COALESCE(SUM(amount) FILTER (WHERE period = 'trimestral' AND active = true), 0) as trimestral_total,
        COALESCE(SUM(amount) FILTER (WHERE period = 'anual' AND active = true), 0) as anual_total,

        -- Contadores
        COUNT(*) FILTER (WHERE period = 'mensal' AND active = true) as monthly_count,
        COUNT(*) FILTER (WHERE period = 'trimestral' AND active = true) as trimestral_count,
        COUNT(*) FILTER (WHERE period = 'anual' AND active = true) as anual_count,
        COUNT(*) as total_subscriptions,
        COUNT(*) FILTER (WHERE active = true) as active_subscriptions
      FROM subscriptions
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao calcular total de assinaturas:', error);
    res.status(500).json({ error: 'Erro ao calcular total de assinaturas' });
  }
});

// Criar nova assinatura
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { title, contract_date, amount, period, next_charge_date, category } = req.body;

    const result = await pool.query(
      `INSERT INTO subscriptions
       (title, contract_date, amount, period, next_charge_date, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, contract_date, amount, period, next_charge_date, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ error: 'Erro ao criar assinatura' });
  }
});

// Atualizar assinatura
app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contract_date, amount, period, next_charge_date, category, active } = req.body;

    const result = await pool.query(
      `UPDATE subscriptions
       SET title = $1, contract_date = $2, amount = $3, period = $4,
           next_charge_date = $5, category = $6, active = $7
       WHERE id = $8
       RETURNING *`,
      [title, contract_date, amount, period, next_charge_date, category, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ error: 'Erro ao atualizar assinatura' });
  }
});

// Deletar assinatura
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    res.json({ message: 'Assinatura excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir assinatura:', error);
    res.status(500).json({ error: 'Erro ao excluir assinatura' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = pool;
