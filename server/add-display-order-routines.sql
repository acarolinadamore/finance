-- Adicionar coluna display_order na tabela routines
ALTER TABLE routines ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_routines_display_order ON routines(display_order);

-- Criar índice composto para ordenação por período e ordem
CREATE INDEX IF NOT EXISTS idx_routines_period_display_order ON routines(period, display_order);
