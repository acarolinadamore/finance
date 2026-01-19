-- Tabela de listas de tarefas
CREATE TABLE IF NOT EXISTS todo_lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens das listas de tarefas
CREATE TABLE IF NOT EXISTS todo_list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  checked INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_todo_list_items_list_id ON todo_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_display_order ON todo_lists(display_order);
CREATE INDEX IF NOT EXISTS idx_todo_list_items_display_order ON todo_list_items(display_order);
