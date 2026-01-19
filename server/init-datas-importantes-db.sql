-- ================================
-- MÓDULO DATAS IMPORTANTES
-- ================================

-- Tabela de categorias/áreas da vida
CREATE TABLE IF NOT EXISTS important_dates_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL, -- Nome do ícone do lucide-react
  color VARCHAR(7) DEFAULT '#6366f1',
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de datas importantes
CREATE TABLE IF NOT EXISTS important_dates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Para futura integração com usuários
  date DATE NOT NULL,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED, -- Campo calculado para facilitar filtros
  title VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(500), -- URL opcional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento many-to-many (evento pode ter múltiplas categorias)
CREATE TABLE IF NOT EXISTS important_dates_tags (
  id SERIAL PRIMARY KEY,
  important_date_id INTEGER NOT NULL REFERENCES important_dates(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES important_dates_categories(id) ON DELETE CASCADE,
  UNIQUE(important_date_id, category_id) -- Evita duplicação
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_important_dates_date ON important_dates(date DESC);
CREATE INDEX IF NOT EXISTS idx_important_dates_year ON important_dates(year DESC);
CREATE INDEX IF NOT EXISTS idx_important_dates_user ON important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_tags_date ON important_dates_tags(important_date_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_tags_category ON important_dates_tags(category_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_important_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS important_dates_updated_at_trigger ON important_dates;
CREATE TRIGGER important_dates_updated_at_trigger
BEFORE UPDATE ON important_dates
FOR EACH ROW
EXECUTE FUNCTION update_important_dates_updated_at();

-- Inserir categorias padrão
INSERT INTO important_dates_categories (name, icon, color, display_order) VALUES
('Pessoal', 'User', '#3b82f6', 1),
('Espiritual', 'Sparkles', '#8b5cf6', 2),
('Saúde', 'Heart', '#ec4899', 3),
('Romântica', 'HeartHandshake', '#f43f5e', 4),
('Familiar', 'Users', '#10b981', 5),
('Processo', 'FileCheck', '#f59e0b', 6),
('Profissional', 'Briefcase', '#06b6d4', 7),
('Financeiro', 'DollarSign', '#84cc16', 8),
('Educacional', 'GraduationCap', '#a855f7', 9),
('Viagem', 'Plane', '#14b8a6', 10)
ON CONFLICT (name) DO NOTHING;

-- View para facilitar consultas com tags
CREATE OR REPLACE VIEW important_dates_with_tags AS
SELECT
    id.id,
    id.user_id,
    id.date,
    id.year,
    id.title,
    id.description,
    id.link,
    id.created_at,
    id.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', idc.id,
                'name', idc.name,
                'icon', idc.icon,
                'color', idc.color
            ) ORDER BY idc.display_order
        ) FILTER (WHERE idc.id IS NOT NULL),
        '[]'
    ) as tags
FROM important_dates id
LEFT JOIN important_dates_tags idt ON id.id = idt.important_date_id
LEFT JOIN important_dates_categories idc ON idt.category_id = idc.id
GROUP BY id.id, id.user_id, id.date, id.year, id.title, id.description, id.link, id.created_at, id.updated_at;

-- Comentários nas tabelas
COMMENT ON TABLE important_dates IS 'Armazena datas e acontecimentos memoráveis importantes';
COMMENT ON TABLE important_dates_categories IS 'Categorias/áreas da vida para classificar as datas importantes';
COMMENT ON TABLE important_dates_tags IS 'Relacionamento many-to-many entre datas e categorias';
COMMENT ON COLUMN important_dates.year IS 'Ano extraído automaticamente da data para facilitar filtros';
COMMENT ON COLUMN important_dates.link IS 'URL opcional relacionada ao evento';
