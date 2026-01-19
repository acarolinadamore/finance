-- ============================================
-- SCRIPT DE MIGRAÇÃO - SISTEMA DE AUTENTICAÇÃO
-- ============================================
-- Execute este script no pgAdmin (Query Tool)
-- ============================================

-- PASSO 1: Criar tabela de usuários
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para otimizar buscas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- PASSO 2: Criar tabela para reset de senha
-- ============================================
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

-- ============================================
-- PASSO 3: Criar usuário admin inicial
-- ============================================
-- Senha temporária: "admin123" (você vai trocar no primeiro login)
-- Hash bcrypt da senha "admin123"
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'acarolinadamore@gmail.com',
  '$2b$10$rHJmV8xJKKKvH5L5YyH5HePqJKkKvH5L5YyH5HePqJKkKvH5L5Yy',
  'Ana Carolina',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Pegar o ID do usuário admin para usar nas próximas etapas
DO $$
DECLARE
  admin_user_id INTEGER;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'acarolinadamore@gmail.com';

  -- Guardar o ID em uma variável temporária
  RAISE NOTICE 'Admin user ID: %', admin_user_id;
END $$;

-- ============================================
-- PASSO 4: Adicionar coluna user_id em TODAS as tabelas
-- ============================================

-- Rotinas
ALTER TABLE routines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);

-- Completions de rotinas
ALTER TABLE routine_completions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_routine_completions_user_id ON routine_completions(user_id);

-- Hábitos
ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Completions de hábitos
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);

-- Moods (Humor)
ALTER TABLE daily_moods ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_daily_moods_user_id ON daily_moods(user_id);

-- Ciclo Feminino - Settings
ALTER TABLE cycle_settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cycle_settings_user_id ON cycle_settings(user_id);

-- Ciclo Feminino - Records
ALTER TABLE cycle_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cycle_records_user_id ON cycle_records(user_id);

-- Eventos (Calendário)
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Sonhos
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);

-- Metas
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Wishlist
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- Lista de Mercado
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

-- Itens da Lista de Mercado
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user_id ON shopping_list_items(user_id);

-- Lista de Tarefas (ToDo)
ALTER TABLE todo_lists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);

-- Itens da Lista de Tarefas
ALTER TABLE todo_list_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_todo_list_items_user_id ON todo_list_items(user_id);

-- ============================================
-- PASSO 5: Migrar dados existentes para o admin
-- ============================================

DO $$
DECLARE
  admin_user_id INTEGER;
BEGIN
  -- Pegar ID do admin
  SELECT id INTO admin_user_id FROM users WHERE email = 'acarolinadamore@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Atualizar todas as tabelas com o user_id do admin
    UPDATE routines SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE routine_completions SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE habits SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE habit_completions SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE daily_moods SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE cycle_settings SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE cycle_records SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE events SET user_id = admin_user_id WHERE user_id IS NULL;

    -- Se as tabelas existirem, atualizar também
    UPDATE dreams SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM dreams);
    UPDATE goals SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM goals);
    UPDATE wishlist_items SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM wishlist_items);
    UPDATE shopping_lists SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM shopping_lists);
    UPDATE shopping_list_items SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM shopping_list_items);
    UPDATE todo_lists SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM todo_lists);
    UPDATE todo_list_items SET user_id = admin_user_id WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM todo_list_items);

    RAISE NOTICE 'Dados migrados para o usuário admin (ID: %)', admin_user_id;
  ELSE
    RAISE EXCEPTION 'Usuário admin não encontrado!';
  END IF;
END $$;

-- ============================================
-- PASSO 6: Tornar user_id obrigatório (NOT NULL)
-- ============================================
-- Depois que todos os dados foram migrados, tornar a coluna obrigatória

ALTER TABLE routines ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE routine_completions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE habit_completions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE daily_moods ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE cycle_settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE cycle_records ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN user_id SET NOT NULL;

-- Para as outras tabelas, só tornar NOT NULL se existirem dados
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM dreams LIMIT 1) THEN
    ALTER TABLE dreams ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM goals LIMIT 1) THEN
    ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM wishlist_items LIMIT 1) THEN
    ALTER TABLE wishlist_items ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM shopping_lists LIMIT 1) THEN
    ALTER TABLE shopping_lists ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM shopping_list_items LIMIT 1) THEN
    ALTER TABLE shopping_list_items ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM todo_lists LIMIT 1) THEN
    ALTER TABLE todo_lists ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM todo_list_items LIMIT 1) THEN
    ALTER TABLE todo_list_items ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se o usuário admin foi criado
SELECT id, email, name, role, created_at
FROM users
WHERE email = 'acarolinadamore@gmail.com';

-- Contar registros por tabela para o admin
DO $$
DECLARE
  admin_user_id INTEGER;
  routines_count INTEGER;
  habits_count INTEGER;
  moods_count INTEGER;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'acarolinadamore@gmail.com';

  SELECT COUNT(*) INTO routines_count FROM routines WHERE user_id = admin_user_id;
  SELECT COUNT(*) INTO habits_count FROM habits WHERE user_id = admin_user_id;
  SELECT COUNT(*) INTO moods_count FROM daily_moods WHERE user_id = admin_user_id;

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Admin User ID: %', admin_user_id;
  RAISE NOTICE 'Email: acarolinadamore@gmail.com';
  RAISE NOTICE 'Senha temporária: admin123';
  RAISE NOTICE '-------------------------------------------';
  RAISE NOTICE 'Dados migrados:';
  RAISE NOTICE '  - Rotinas: % registros', routines_count;
  RAISE NOTICE '  - Hábitos: % registros', habits_count;
  RAISE NOTICE '  - Moods: % registros', moods_count;
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'PRÓXIMO PASSO: Trocar a senha no primeiro login!';
  RAISE NOTICE '===========================================';
END $$;
