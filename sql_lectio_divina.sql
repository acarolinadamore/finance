-- TABELA PARA LECTIO DIVINA
CREATE TABLE IF NOT EXISTS lectio_divina (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  livro VARCHAR(100),
  capitulo INTEGER,
  versiculo VARCHAR(20),
  lectio TEXT,
  meditatio TEXT,
  oratio TEXT,
  contemplatio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lectio_divina_user ON lectio_divina(user_id);
CREATE INDEX IF NOT EXISTS idx_lectio_divina_data ON lectio_divina(user_id, data DESC);

COMMENT ON TABLE lectio_divina IS 'Armazena meditações de Lectio Divina';
COMMENT ON COLUMN lectio_divina.data IS 'Data da meditação (sem hora)';
COMMENT ON COLUMN lectio_divina.livro IS 'Livro bíblico (opcional)';
COMMENT ON COLUMN lectio_divina.capitulo IS 'Capítulo (opcional)';
COMMENT ON COLUMN lectio_divina.versiculo IS 'Versículo (opcional)';
COMMENT ON COLUMN lectio_divina.lectio IS '1 - LECTIO — O que o texto diz?';
COMMENT ON COLUMN lectio_divina.meditatio IS '2 - MEDITATIO — Que verdade da fé a Igreja ensina aqui?';
COMMENT ON COLUMN lectio_divina.oratio IS '3 - ORATIO — O que devo pedir a Deus?';
COMMENT ON COLUMN lectio_divina.contemplatio IS '4 - CONTEMPLATIO — Silêncio';
