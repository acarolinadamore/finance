-- ============================================
-- TABELA DE VERSÍCULOS FAVORITOS
-- ============================================
-- Execute este script no Query Tools do PostgreSQL

CREATE TABLE IF NOT EXISTS favorite_verses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  livro VARCHAR(100) NOT NULL,
  capitulo INTEGER NOT NULL,
  versiculo VARCHAR(20) NOT NULL,
  texto TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_favorite_verses_user ON favorite_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_verses_order ON favorite_verses(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_favorite_verses_book ON favorite_verses(user_id, livro);

COMMENT ON TABLE favorite_verses IS 'Armazena versículos bíblicos favoritos organizados por livro, capítulo e versículo';
COMMENT ON COLUMN favorite_verses.livro IS 'Nome do livro bíblico (ex: João, Isaías, Salmos)';
COMMENT ON COLUMN favorite_verses.capitulo IS 'Número do capítulo';
COMMENT ON COLUMN favorite_verses.versiculo IS 'Número do versículo ou range (ex: "3" ou "12-14")';
COMMENT ON COLUMN favorite_verses.texto IS 'Texto completo do versículo';
COMMENT ON COLUMN favorite_verses.display_order IS 'Ordem de exibição personalizada pelo usuário';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute este SELECT para confirmar que a tabela foi criada:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name = 'favorite_verses';

-- ============================================
-- EXEMPLO DE INSERÇÃO
-- ============================================
-- INSERT INTO favorite_verses (user_id, livro, capitulo, versiculo, texto, display_order)
-- VALUES
-- (1, 'João', 3, '16', 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', 1),
-- (1, 'Isaías', 41, '10', 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.', 2),
-- (1, 'Salmos', 23, '1-4', 'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas...', 3);
