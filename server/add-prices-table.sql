-- Criar tabela de preços para itens da wishlist
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

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_wishlist_item_prices_item_id ON wishlist_item_prices(item_id);

-- Adicionar trigger
DROP TRIGGER IF EXISTS update_wishlist_item_prices_updated_at ON wishlist_item_prices;
CREATE TRIGGER update_wishlist_item_prices_updated_at
    BEFORE UPDATE ON wishlist_item_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
