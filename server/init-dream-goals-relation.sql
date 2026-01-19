-- Tabela de relacionamento entre sonhos e metas
CREATE TABLE IF NOT EXISTS dream_goals (
  id SERIAL PRIMARY KEY,
  dream_id INTEGER NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dream_id, goal_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_dream_goals_dream_id ON dream_goals(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_goals_goal_id ON dream_goals(goal_id);
