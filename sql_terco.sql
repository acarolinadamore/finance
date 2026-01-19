-- TABELA PARA OFERECIMENTO E MISTÉRIOS DO TERÇO
CREATE TABLE IF NOT EXISTS rosary_content (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('oferecimento', 'gloriosos', 'gozosos', 'dolorosos', 'oracoes_finais')),
  conteudo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_rosary_content_user ON rosary_content(user_id);

COMMENT ON TABLE rosary_content IS 'Armazena oferecimento e mistérios do Santo Terço';
COMMENT ON COLUMN rosary_content.tipo IS 'Tipo de conteúdo: oferecimento, gloriosos, gozosos ou dolorosos';
