-- TABELA DE DUVIDAS ESPIRITUAIS
CREATE TABLE IF NOT EXISTS spiritual_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  contexto TEXT,
  resposta TEXT,
  status VARCHAR(20) DEFAULT 'pendente',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spiritual_questions_user ON spiritual_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_questions_order ON spiritual_questions(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_spiritual_questions_status ON spiritual_questions(user_id, status);
