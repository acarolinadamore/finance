-- ============================================
-- SQL COMPLETO DO MÓDULO CATÓLICO
-- ============================================
-- Execute este script no Query Tools do PostgreSQL
-- Copie e cole todo o conteúdo

-- ============================================
-- TABELAS DE ORAÇÕES DO DIA (Manhã/Tarde/Noite)
-- ============================================

CREATE TABLE IF NOT EXISTS prayer_periods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL CHECK (period IN ('morning', 'afternoon', 'night')),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_prayer_periods_user ON prayer_periods(user_id);

COMMENT ON TABLE prayer_periods IS 'Armazena as orações organizadas por período do dia (Manhã/Tarde/Noite)';

-- ============================================
-- TABELAS DE NOVENAS (Cards individuais)
-- ============================================

CREATE TABLE IF NOT EXISTS novenas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_novenas_user ON novenas(user_id);
CREATE INDEX IF NOT EXISTS idx_novenas_order ON novenas(user_id, display_order);

COMMENT ON TABLE novenas IS 'Armazena novenas como itens individuais reordenáveis';

-- ============================================
-- TABELAS DE JACULATÓRIAS (Cards individuais)
-- ============================================

CREATE TABLE IF NOT EXISTS ejaculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ejaculations_user ON ejaculations(user_id);
CREATE INDEX IF NOT EXISTS idx_ejaculations_order ON ejaculations(user_id, display_order);

COMMENT ON TABLE ejaculations IS 'Armazena jaculatórias como itens individuais reordenáveis';

-- ============================================
-- TABELAS DE PENITÊNCIAS (Cards individuais)
-- ============================================

CREATE TABLE IF NOT EXISTS penances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_penances_user ON penances(user_id);
CREATE INDEX IF NOT EXISTS idx_penances_order ON penances(user_id, display_order);

COMMENT ON TABLE penances IS 'Armazena orações de penitência como itens individuais reordenáveis';

-- ============================================
-- TABELAS DE OFERECIMENTOS (Cards individuais)
-- ============================================

CREATE TABLE IF NOT EXISTS offerings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offerings_user ON offerings(user_id);
CREATE INDEX IF NOT EXISTS idx_offerings_order ON offerings(user_id, display_order);

COMMENT ON TABLE offerings IS 'Armazena oferecimentos como itens individuais reordenáveis';

-- ============================================
-- TABELAS ANTIGAS (já existentes)
-- ============================================
-- As tabelas prayers, spiritual_readings e confessions já existem
-- Não precisa recriar

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute este SELECT para confirmar que as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('prayer_periods', 'novenas', 'ejaculations', 'penances', 'offerings')
-- ORDER BY table_name;
