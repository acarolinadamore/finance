// ========================================
// ROTAS DA LISTA DE ACESSOS
// ========================================

module.exports = (app, pool) => {
  // Obter todas as listas de acessos com seus itens
  app.get('/api/access-lists', async (req, res) => {
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
  app.post('/api/access-lists', async (req, res) => {
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

  // Atualizar nome da lista de acessos
  app.put('/api/access-lists/:id', async (req, res) => {
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
  app.delete('/api/access-lists/:id', async (req, res) => {
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

  // Reordenar listas de acessos
  app.put('/api/access-lists/reorder', async (req, res) => {
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

  // Adicionar item à lista de acessos
  app.post('/api/access-lists/:listId/items', async (req, res) => {
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
  app.put('/api/access-list-items/:id', async (req, res) => {
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
  app.delete('/api/access-list-items/:id', async (req, res) => {
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
};
