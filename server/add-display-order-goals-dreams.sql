-- Adicionar campo display_order nas tabelas goals e dreams para permitir reordenação

-- Goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS display_order INTEGER;
UPDATE goals SET display_order = id WHERE display_order IS NULL;

-- Dreams
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS display_order INTEGER;
UPDATE dreams SET display_order = id WHERE display_order IS NULL;
