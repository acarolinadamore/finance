-- ============================================
-- MÓDULO CATÓLICO - ESTRUTURA DE BANCO DE DADOS
-- ============================================

-- Tabela de Orações
CREATE TABLE IF NOT EXISTS prayers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100), -- ex: 'Manhã', 'Noite', 'Terço', 'Novena', etc.
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leituras Espirituais
CREATE TABLE IF NOT EXISTS spiritual_readings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  book_name VARCHAR(255), -- ex: 'Bíblia', 'Imitação de Cristo', etc.
  reference VARCHAR(255), -- ex: 'João 3:16', 'Capítulo 5', etc.
  content TEXT,
  notes TEXT, -- reflexões pessoais
  date_read DATE,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Confissões
CREATE TABLE IF NOT EXISTS confessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  confession_date DATE NOT NULL,
  notes TEXT, -- preparação para confissão, exame de consciência
  penance TEXT, -- penitência recebida
  confessor_name VARCHAR(255), -- opcional
  location VARCHAR(255), -- opcional - igreja onde confessou
  is_completed BOOLEAN DEFAULT true, -- se já confessou
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registro de Orações Diárias (tracking de orações feitas)
CREATE TABLE IF NOT EXISTS daily_prayer_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prayer_id INTEGER REFERENCES prayers(id) ON DELETE SET NULL,
  prayer_name VARCHAR(255) NOT NULL, -- caso a oração seja deletada, mantém o nome
  date_prayed DATE NOT NULL,
  time_spent_minutes INTEGER, -- tempo gasto em oração (opcional)
  notes TEXT, -- reflexões sobre a oração
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_category ON prayers(category);
CREATE INDEX IF NOT EXISTS idx_spiritual_readings_user_id ON spiritual_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_readings_date ON spiritual_readings(date_read);
CREATE INDEX IF NOT EXISTS idx_confessions_user_id ON confessions(user_id);
CREATE INDEX IF NOT EXISTS idx_confessions_date ON confessions(confession_date);
CREATE INDEX IF NOT EXISTS idx_daily_prayer_tracking_user_id ON daily_prayer_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_prayer_tracking_date ON daily_prayer_tracking(date_prayed);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON prayers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spiritual_readings_updated_at BEFORE UPDATE ON spiritual_readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confessions_updated_at BEFORE UPDATE ON confessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
