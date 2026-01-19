-- ============================================
-- TABELA DE DÚVIDAS ESPIRITUAIS
-- ============================================
-- Execute este script no Query Tools do PostgreSQL

CREATE TABLE IF NOT EXISTS spiritual_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  contexto TEXT,
  resposta TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondida')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_spiritual_questions_user ON spiritual_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_questions_order ON spiritual_questions(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_spiritual_questions_status ON spiritual_questions(user_id, status);

COMMENT ON TABLE spiritual_questions IS 'Armazena dúvidas espirituais para levar ao padre';
COMMENT ON COLUMN spiritual_questions.pergunta IS 'A dúvida/pergunta a ser feita ao padre';
COMMENT ON COLUMN spiritual_questions.contexto IS 'Contexto opcional (leitura, versículo, situação)';
COMMENT ON COLUMN spiritual_questions.resposta IS 'Resposta dada pelo padre';
COMMENT ON COLUMN spiritual_questions.status IS 'Status da dúvida: pendente ou respondida';
COMMENT ON COLUMN spiritual_questions.display_order IS 'Ordem de exibição personalizada pelo usuário';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute este SELECT para confirmar que a tabela foi criada:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name = 'spiritual_questions';

-- ============================================
-- EXEMPLO DE INSERÇÃO
-- ============================================
-- INSERT INTO spiritual_questions (user_id, pergunta, contexto, status, display_order)
-- VALUES
-- (1, 'Como posso aprofundar minha oração pessoal?', 'Lendo sobre vida de oração no Catecismo', 'pendente', 1),
-- (1, 'Qual a diferença entre mortificação e penitência?', 'Dúvida durante leitura espiritual', 'pendente', 2),
-- (1, 'Como lidar com distrações durante a missa?', NULL, 'pendente', 3);
