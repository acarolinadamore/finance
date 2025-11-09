-- Adicionar campo 'life_area_id' na tabela dreams
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS life_area_id INTEGER REFERENCES life_areas(id) ON DELETE SET NULL;
