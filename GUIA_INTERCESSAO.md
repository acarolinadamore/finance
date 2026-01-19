# 🙏 Guia de Implementação - Intercessão

## 📋 Visão Geral

Este guia explica como adicionar a funcionalidade de **Intercessão** na página de Orações Católicas.

### Características:
- ✨ Nova aba "Intercessão" (segunda posição, após "Dia a Dia")
- 🎯 Ícone: Mão (Hand)
- 📝 Permite criar múltiplas caixas de oração
- ✏️ Título personalizável para cada intercessão
- 📄 Textarea livre para o conteúdo da oração
- 🔄 Ordenação por drag-and-drop

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `intercessions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | Identificador único |
| `user_id` | INTEGER | ID do usuário (FK para users) |
| `title` | VARCHAR(255) | Título da intercessão (ex: "Pela Família") |
| `content` | TEXT | Conteúdo da oração |
| `display_order` | INTEGER | Ordem de exibição |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização (auto) |

### Índices:
- `idx_intercessions_user`: Índice em `user_id`
- `idx_intercessions_order`: Índice composto em `user_id, display_order`

---

## 🚀 Como Executar a Migração

### Passo 1: Executar o script de migração

```bash
node server/run-intercessions-migration.js
```

### Passo 2: Verificar se a tabela foi criada

Você pode verificar no PostgreSQL:

```sql
-- Ver estrutura da tabela
\d intercessions

-- Ver se está vazia
SELECT * FROM intercessions;
```

---

## 📝 Exemplos de Uso SQL

### 1. Inserir uma nova intercessão

```sql
INSERT INTO intercessions (user_id, title, content, display_order)
VALUES (1, 'Pela Família', 'Senhor, intercedo por minha família...', 0);
```

### 2. Inserir várias intercessões

```sql
INSERT INTO intercessions (user_id, title, content, display_order)
VALUES
  (1, 'Pela Família', 'Senhor, intercedo por minha família para que sejam protegidos...', 0),
  (1, 'Pelos Doentes', 'Pai misericordioso, intercedo por todos os enfermos...', 1),
  (1, 'Pelos Necessitados', 'Deus providente, intercedo pelos que passam necessidade...', 2);
```

### 3. Listar todas as intercessões de um usuário

```sql
SELECT id, title, LEFT(content, 50) as preview, display_order, created_at
FROM intercessions
WHERE user_id = 1
ORDER BY display_order, id;
```

### 4. Atualizar uma intercessão

```sql
UPDATE intercessions
SET title = 'Pela Igreja',
    content = 'Senhor Jesus, intercedo pela Santa Igreja...'
WHERE id = 1 AND user_id = 1;
```

### 5. Deletar uma intercessão

```sql
DELETE FROM intercessions
WHERE id = 1 AND user_id = 1;
```

### 6. Reordenar intercessões

```sql
-- Mover intercessão para primeira posição
UPDATE intercessions SET display_order = 0 WHERE id = 3 AND user_id = 1;

-- Ajustar outras
UPDATE intercessions SET display_order = 1 WHERE id = 1 AND user_id = 1;
UPDATE intercessions SET display_order = 2 WHERE id = 2 AND user_id = 1;
```

---

## 🎨 Aparência Visual

As caixas de intercessão terão aparência similar às de Manhã/Tarde/Noite:

### Esquema de Cores Sugerido (tema roxo/rosa):
```css
- Border: border-pink-200 ou border-purple-200
- Background: bg-gradient-to-br from-pink-50 to-purple-50
- Título: text-pink-800 ou text-purple-800
- Ícone: bg-pink-500 ou bg-purple-500 com Hand icon
- Botão: bg-pink-600 hover:bg-pink-700
```

---

## 🔧 Próximos Passos (Backend)

### 1. Adicionar rotas no `server/index.js`:

```javascript
// GET - Listar todas as intercessões do usuário
app.get('/api/catolico/intercessions', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const result = await pool.query(
      'SELECT * FROM intercessions WHERE user_id = $1 ORDER BY display_order, id',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar intercessões:', error);
    res.status(500).json({ error: 'Erro ao buscar intercessões' });
  }
});

// POST - Criar nova intercessão
app.post('/api/catolico/intercessions', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO intercessions (user_id, title, content, display_order) VALUES ($1, $2, $3, COALESCE((SELECT MAX(display_order) + 1 FROM intercessions WHERE user_id = $1), 0)) RETURNING *',
      [user_id, title.trim(), content.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar intercessão:', error);
    res.status(500).json({ error: 'Erro ao criar intercessão' });
  }
});

// PUT - Atualizar intercessão
app.put('/api/catolico/intercessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const user_id = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const result = await pool.query(
      'UPDATE intercessions SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [title.trim(), content.trim(), id, user_id]
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

// DELETE - Deletar intercessão
app.delete('/api/catolico/intercessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const result = await pool.query(
      'DELETE FROM intercessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
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

// PUT - Reordenar intercessões
app.put('/api/catolico/intercessions/reorder', authenticateToken, async (req, res) => {
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
          'UPDATE intercessions SET display_order = $1 WHERE id = $2 AND user_id = $3',
          [item.display_order, item.id, user_id]
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
    console.error('Erro ao reordenar intercessões:', error);
    res.status(500).json({ error: 'Erro ao reordenar intercessões' });
  }
});
```

---

## 📱 Próximos Passos (Frontend)

1. Criar componente `IntercessionsSection.tsx` (similar a `NovenasSection.tsx`)
2. Adicionar aba "Intercessão" no `PrayersTabNew.tsx`
3. Importar ícone `Hand` do lucide-react
4. Criar hook ou usar API diretamente para CRUD

---

## ✅ Checklist de Implementação

- [x] Criar arquivo SQL (`sql_intercessions.sql`)
- [x] Criar script de migração (`run-intercessions-migration.js`)
- [ ] Executar migração no banco de dados
- [ ] Adicionar rotas no backend (`server/index.js`)
- [ ] Criar componente `IntercessionsSection.tsx`
- [ ] Adicionar aba no `PrayersTabNew.tsx`
- [ ] Testar CRUD completo
- [ ] Testar reordenação

---

## 📞 Suporte

Se tiver dúvidas ou encontrar problemas, verifique:
1. Se o banco de dados está rodando
2. Se as variáveis de ambiente estão corretas
3. Se o usuário tem as permissões necessárias
4. Os logs do servidor para mensagens de erro
