-- Adicionar campo display_order nas tabelas para permitir reordenação

-- Wishlists
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS display_order INTEGER;
UPDATE wishlists SET display_order = id WHERE display_order IS NULL;

-- Shopping Lists
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS display_order INTEGER;
UPDATE shopping_lists SET display_order = id WHERE display_order IS NULL;
