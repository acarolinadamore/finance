# Setup da Wishlist

## 1. Executar o Script SQL no PostgreSQL

Você precisa executar o script SQL para criar as tabelas no banco de dados.

### Opção 1: Via pgAdmin

1. Abra o **pgAdmin**
2. Conecte-se ao seu banco de dados
3. Clique com o botão direito no banco de dados → **Query Tool**
4. Abra o arquivo `server/init-wishlist-db.sql` e copie o conteúdo
5. Cole no Query Tool e clique em **Execute** (F5)

### Opção 2: Via linha de comando

```bash
psql -U seu_usuario -d nome_do_banco -f server/init-wishlist-db.sql
```

## 2. Estrutura das Tabelas

### Tabela `wishlists`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255)) - Nome da lista
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela `wishlist_items`
- `id` (SERIAL PRIMARY KEY)
- `wishlist_id` (INTEGER) - Referência à wishlist
- `name` (VARCHAR(255)) - **Obrigatório** - Nome do item
- `price` (DECIMAL(10,2)) - **Opcional** - Preço do item
- `link` (TEXT) - **Opcional** - Link para o produto
- `checked` (BOOLEAN) - Se o item foi comprado
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 3. Endpoints da API

Todos disponíveis em `http://localhost:3001/api`:

### Wishlists
- `GET /wishlists` - Listar todas as wishlists com itens
- `POST /wishlists` - Criar nova wishlist
  - Body: `{ "name": "Nome da Lista" }`
- `PUT /wishlists/:id` - Atualizar nome da wishlist
  - Body: `{ "name": "Novo Nome" }`
- `DELETE /wishlists/:id` - Excluir wishlist (CASCADE exclui itens)

### Items
- `POST /wishlists/:wishlistId/items` - Adicionar item
  - Body: `{ "name": "Item", "price": 99.90, "link": "https://..." }`
  - Apenas `name` é obrigatório
- `PUT /wishlist-items/:id` - Atualizar item (nome, preço, link ou checked)
  - Body: `{ "name": "...", "price": 99.90, "link": "...", "checked": true }`
- `DELETE /wishlist-items/:id` - Excluir item

## 4. Funcionalidades Implementadas

✅ Criar/Editar/Excluir listas
✅ Adicionar/Editar/Excluir itens
✅ Marcar itens como comprados (checkbox - risca o item)
✅ Campos opcionais: preço e link
✅ Cálculo automático do total dos itens selecionados
✅ Persistência no PostgreSQL

## 5. Como Usar

1. Execute o script SQL no PostgreSQL
2. Inicie o backend: `npm run server` (ou `nodemon server/index.js`)
3. Inicie o frontend: `npm run dev`
4. Acesse: `http://localhost:3031/wishlist`
