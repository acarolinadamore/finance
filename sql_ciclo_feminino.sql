-- ===================================================================
-- SCHEMA DO MÓDULO CICLO FEMININO
-- Execute este SQL no pgAdmin (Query Tool) no banco "finance"
-- ===================================================================

-- Tabela de configurações do ciclo (uma única linha por usuário)
CREATE TABLE IF NOT EXISTS cycle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_period_start_date DATE NOT NULL,
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  luteal_phase_length INTEGER DEFAULT 14,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de registros diários do ciclo
-- NOTA: O humor é registrado na tabela daily_moods (módulo existente)
CREATE TABLE IF NOT EXISTS cycle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date DATE NOT NULL UNIQUE,
  flow_level VARCHAR(20) CHECK (flow_level IN ('none', 'light', 'moderate', 'heavy')),
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Se a tabela já existe com mood_rating, remova a coluna
ALTER TABLE cycle_records DROP COLUMN IF EXISTS mood_rating;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_cycle_records_date ON cycle_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_records_flow ON cycle_records(flow_level);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cycle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cycle_settings_updated_at
  BEFORE UPDATE ON cycle_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_cycle_updated_at();

CREATE TRIGGER cycle_records_updated_at
  BEFORE UPDATE ON cycle_records
  FOR EACH ROW
  EXECUTE FUNCTION update_cycle_updated_at();

-- Inserir configurações padrão (se não existir)
INSERT INTO cycle_settings (last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length)
VALUES (CURRENT_DATE, 28, 5, 14)
ON CONFLICT DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' AS status;
SELECT * FROM cycle_settings;
