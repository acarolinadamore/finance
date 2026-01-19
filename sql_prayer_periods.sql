-- Tabela para armazenar orações por período do dia (Manhã/Tarde/Noite)
CREATE TABLE IF NOT EXISTS prayer_periods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL CHECK (period IN ('morning', 'afternoon', 'night')),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period)
);

-- Tabela para armazenar categorias especiais de oração
CREATE TABLE IF NOT EXISTS prayer_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('novenas', 'ejaculations', 'penance', 'offerings')),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_prayer_periods_user ON prayer_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_categories_user ON prayer_categories(user_id);

-- Comentários
COMMENT ON TABLE prayer_periods IS 'Armazena as orações organizadas por período do dia';
COMMENT ON TABLE prayer_categories IS 'Armazena categorias especiais de oração (novenas, jaculatórias, etc)';
