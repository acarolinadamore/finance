-- Script para criar as tabelas da Wishlist no PostgreSQL

-- Tabela de listas de desejos
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    link TEXT,
    checked BOOLEAN DEFAULT FALSE,
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_checked ON wishlist_items(checked);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_selected ON wishlist_items(selected);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_wishlists_updated_at ON wishlists;
CREATE TRIGGER update_wishlists_updated_at
    BEFORE UPDATE ON wishlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Dados de exemplo (opcional - pode comentar se não quiser)
-- INSERT INTO wishlists (name) VALUES
--     ('Eletrônicos'),
--     ('Casa');

-- INSERT INTO wishlist_items (wishlist_id, name, price, link, checked) VALUES
--     (1, 'iPhone 15 Pro', 7999.00, 'https://www.apple.com/br/iphone-15-pro/', false),
--     (1, 'MacBook Air M3', 9999.00, 'https://www.apple.com/br/macbook-air/', false),
--     (2, 'Sofá 3 lugares', 2500.00, '', true);
