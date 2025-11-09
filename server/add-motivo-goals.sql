-- Adicionar campos 'motivo', 'obstaculo' e 'recompensa' na tabela goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS obstaculo TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS recompensa TEXT;
