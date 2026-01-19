-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6b7280',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre metas e tags
CREATE TABLE IF NOT EXISTS goal_tags (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(goal_id, tag_id)
);

-- Tabela de relacionamento entre sonhos e tags
CREATE TABLE IF NOT EXISTS dream_tags (
  id SERIAL PRIMARY KEY,
  dream_id INTEGER NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dream_id, tag_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_goal_tags_goal_id ON goal_tags(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tags_tag_id ON goal_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_dream_tags_dream_id ON dream_tags(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_tags_tag_id ON dream_tags(tag_id);
