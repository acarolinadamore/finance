-- Migration: Adicionar suporte para múltiplos preços por item

-- 1. Criar nova tabela para preços
CREATE TABLE IF NOT EXISTS wishlist_item_prices (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    link TEXT,
    store_name VARCHAR(255),
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar índice
CREATE INDEX IF NOT EXISTS idx_wishlist_item_prices_item_id ON wishlist_item_prices(item_id);

-- 3. Adicionar trigger para updated_at
DROP TRIGGER IF EXISTS update_wishlist_item_prices_updated_at ON wishlist_item_prices;
CREATE TRIGGER update_wishlist_item_prices_updated_at
    BEFORE UPDATE ON wishlist_item_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Migrar dados existentes (se houver itens com preço)
INSERT INTO wishlist_item_prices (item_id, price, link, selected)
SELECT id, price, link, selected
FROM wishlist_items
WHERE price IS NOT NULL AND price > 0;

-- 5. Remover colunas antigas da tabela wishlist_items (OPCIONAL - comentado por segurança)
-- ALTER TABLE wishlist_items DROP COLUMN IF EXISTS price;
-- ALTER TABLE wishlist_items DROP COLUMN IF EXISTS link;
-- ALTER TABLE wishlist_items DROP COLUMN IF EXISTS selected;
