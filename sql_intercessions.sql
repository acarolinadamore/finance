-- Tabela para Intercessões (Orações de Intercessão)
-- Permite criar múltiplas intercessões com título e conteúdo personalizados

CREATE TABLE IF NOT EXISTS intercessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para melhor performance nas consultas por usuário
CREATE INDEX IF NOT EXISTS idx_intercessions_user ON intercessions(user_id);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_intercessions_order ON intercessions(user_id, display_order);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_intercessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_intercessions_timestamp ON intercessions;
CREATE TRIGGER update_intercessions_timestamp
BEFORE UPDATE ON intercessions
FOR EACH ROW
EXECUTE FUNCTION update_intercessions_updated_at();

-- Exemplos de uso:

-- 1. Inserir uma nova intercessão
-- INSERT INTO intercessions (user_id, title, content, display_order)
-- VALUES (1, 'Pela Família', 'Senhor, intercedo por minha família...', 0);

-- 2. Listar todas as intercessões de um usuário (ordenadas)
-- SELECT * FROM intercessions WHERE user_id = 1 ORDER BY display_order, id;

-- 3. Atualizar uma intercessão
-- UPDATE intercessions
-- SET title = 'Novo Título', content = 'Novo conteúdo'
-- WHERE id = 1 AND user_id = 1;

-- 4. Deletar uma intercessão
-- DELETE FROM intercessions WHERE id = 1 AND user_id = 1;

-- 5. Reordenar intercessões
-- UPDATE intercessions SET display_order = 0 WHERE id = 1 AND user_id = 1;
-- UPDATE intercessions SET display_order = 1 WHERE id = 2 AND user_id = 1;

COMMENT ON TABLE intercessions IS 'Armazena orações de intercessão personalizadas dos usuários';
COMMENT ON COLUMN intercessions.title IS 'Título da intercessão (ex: Pela Família, Pelos Doentes, etc)';
COMMENT ON COLUMN intercessions.content IS 'Conteúdo completo da oração de intercessão';
COMMENT ON COLUMN intercessions.display_order IS 'Ordem de exibição das intercessões';
