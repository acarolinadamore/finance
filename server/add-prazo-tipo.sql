-- Adicionar campo 'prazo_tipo' nas tabelas dreams e goals
-- Valores possíveis: 'curto', 'medio', 'longo'

ALTER TABLE dreams ADD COLUMN IF NOT EXISTS prazo_tipo VARCHAR(10);
ALTER TABLE goals ADD COLUMN IF NOT EXISTS prazo_tipo VARCHAR(10);
