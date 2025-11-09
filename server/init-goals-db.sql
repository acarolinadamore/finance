-- Tabela de áreas da vida (Roda da Vida)
CREATE TABLE IF NOT EXISTS life_areas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  satisfaction_level INTEGER DEFAULT 5 CHECK (satisfaction_level >= 1 AND satisfaction_level <= 10),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  life_area_id INTEGER REFERENCES life_areas(id) ON DELETE SET NULL,
  current_situation TEXT,
  desired_outcome TEXT,
  estimated_deadline DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tarefas das metas
CREATE TABLE IF NOT EXISTS goal_tasks (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_life_areas_updated_at ON life_areas;
CREATE TRIGGER update_life_areas_updated_at BEFORE UPDATE ON life_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goal_tasks_updated_at ON goal_tasks;
CREATE TRIGGER update_goal_tasks_updated_at BEFORE UPDATE ON goal_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir as 12 áreas da vida padrão
INSERT INTO life_areas (name, description, color, satisfaction_level, display_order) VALUES
('Carreira & Trabalho', 'Satisfação no trabalho e crescimento profissional', '#3b82f6', 5, 1),
('Finanças & Dinheiro', 'Segurança financeira e gestão do dinheiro', '#10b981', 5, 2),
('Saúde & Fitness', 'Bem-estar físico e cuidados com o corpo', '#ef4444', 5, 3),
('Família', 'Relacionamento com família e tempo de qualidade', '#f59e0b', 5, 4),
('Amor & Romance', 'Vida amorosa e relacionamento romântico', '#ec4899', 5, 5),
('Vida Social & Amizades', 'Amizades e conexões sociais', '#8b5cf6', 5, 6),
('Crescimento Pessoal', 'Desenvolvimento pessoal e aprendizado', '#06b6d4', 5, 7),
('Recreação & Diversão', 'Lazer, hobbies e momentos de diversão', '#f97316', 5, 8),
('Ambiente Físico', 'Qualidade do espaço onde você vive', '#84cc16', 5, 9),
('Contribuição & Impacto', 'Impacto positivo no mundo e propósito', '#14b8a6', 5, 10),
('Espiritualidade', 'Conexão espiritual e valores profundos', '#a855f7', 5, 11),
('Saúde Mental & Emocional', 'Equilíbrio emocional e saúde mental', '#6366f1', 5, 12)
ON CONFLICT DO NOTHING;
