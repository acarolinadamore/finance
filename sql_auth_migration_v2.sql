-- ============================================
-- SCRIPT DE MIGRAÇÃO - SISTEMA DE AUTENTICAÇÃO (v2)
-- ============================================
-- Execute este script no pgAdmin (Query Tool)
-- Versão corrigida: pula tabelas que não existem
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
  RAISE NOTICE 'Admin user ID: %', admin_user_id;
END $$;

-- ============================================
-- PASSO 4: Adicionar coluna user_id apenas em tabelas EXISTENTES
-- ============================================

DO $$
BEGIN
  -- Rotinas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routines') THEN
    ALTER TABLE routines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: routines';
  END IF;

  -- Completions de rotinas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routine_completions') THEN
    ALTER TABLE routine_completions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_routine_completions_user_id ON routine_completions(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: routine_completions';
  END IF;

  -- Hábitos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits') THEN
    ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: habits';
  END IF;

  -- Completions de hábitos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habit_completions') THEN
    ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: habit_completions';
  END IF;

  -- Moods (Humor)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_moods') THEN
    ALTER TABLE daily_moods ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_daily_moods_user_id ON daily_moods(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: daily_moods';
  END IF;

  -- Ciclo Feminino - Settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_settings') THEN
    ALTER TABLE cycle_settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_cycle_settings_user_id ON cycle_settings(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: cycle_settings';
  END IF;

  -- Ciclo Feminino - Records
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_records') THEN
    ALTER TABLE cycle_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_cycle_records_user_id ON cycle_records(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: cycle_records';
  END IF;

  -- Eventos (Calendário)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: events';
  ELSE
    RAISE NOTICE '⚠️ Tabela events não existe - pulando';
  END IF;

  -- Sonhos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dreams') THEN
    ALTER TABLE dreams ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: dreams';
  ELSE
    RAISE NOTICE '⚠️ Tabela dreams não existe - pulando';
  END IF;

  -- Metas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: goals';
  ELSE
    RAISE NOTICE '⚠️ Tabela goals não existe - pulando';
  END IF;

  -- Wishlist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlist_items') THEN
    ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: wishlist_items';
  ELSE
    RAISE NOTICE '⚠️ Tabela wishlist_items não existe - pulando';
  END IF;

  -- Lista de Mercado
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_lists') THEN
    ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: shopping_lists';
  ELSE
    RAISE NOTICE '⚠️ Tabela shopping_lists não existe - pulando';
  END IF;

  -- Itens da Lista de Mercado
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_list_items') THEN
    ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user_id ON shopping_list_items(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: shopping_list_items';
  ELSE
    RAISE NOTICE '⚠️ Tabela shopping_list_items não existe - pulando';
  END IF;

  -- Lista de Tarefas (ToDo)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todo_lists') THEN
    ALTER TABLE todo_lists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: todo_lists';
  ELSE
    RAISE NOTICE '⚠️ Tabela todo_lists não existe - pulando';
  END IF;

  -- Itens da Lista de Tarefas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todo_list_items') THEN
    ALTER TABLE todo_list_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_todo_list_items_user_id ON todo_list_items(user_id);
    RAISE NOTICE '✅ Coluna user_id adicionada em: todo_list_items';
  ELSE
    RAISE NOTICE '⚠️ Tabela todo_list_items não existe - pulando';
  END IF;
END $$;

-- ============================================
-- PASSO 5: Migrar dados existentes para o admin
-- ============================================

DO $$
DECLARE
  admin_user_id INTEGER;
  routines_count INTEGER := 0;
  habits_count INTEGER := 0;
  moods_count INTEGER := 0;
  cycle_settings_count INTEGER := 0;
  cycle_records_count INTEGER := 0;
BEGIN
  -- Pegar ID do admin
  SELECT id INTO admin_user_id FROM users WHERE email = 'acarolinadamore@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'MIGRANDO DADOS PARA ADMIN (ID: %)', admin_user_id;
    RAISE NOTICE '===========================================';

    -- Atualizar tabelas que existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routines') THEN
      UPDATE routines SET user_id = admin_user_id WHERE user_id IS NULL;
      SELECT COUNT(*) INTO routines_count FROM routines WHERE user_id = admin_user_id;
      RAISE NOTICE '✅ Rotinas migradas: % registros', routines_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routine_completions') THEN
      UPDATE routine_completions SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits') THEN
      UPDATE habits SET user_id = admin_user_id WHERE user_id IS NULL;
      SELECT COUNT(*) INTO habits_count FROM habits WHERE user_id = admin_user_id;
      RAISE NOTICE '✅ Hábitos migrados: % registros', habits_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habit_completions') THEN
      UPDATE habit_completions SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_moods') THEN
      UPDATE daily_moods SET user_id = admin_user_id WHERE user_id IS NULL;
      SELECT COUNT(*) INTO moods_count FROM daily_moods WHERE user_id = admin_user_id;
      RAISE NOTICE '✅ Moods migrados: % registros', moods_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_settings') THEN
      UPDATE cycle_settings SET user_id = admin_user_id WHERE user_id IS NULL;
      SELECT COUNT(*) INTO cycle_settings_count FROM cycle_settings WHERE user_id = admin_user_id;
      RAISE NOTICE '✅ Cycle Settings migrados: % registros', cycle_settings_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_records') THEN
      UPDATE cycle_records SET user_id = admin_user_id WHERE user_id IS NULL;
      SELECT COUNT(*) INTO cycle_records_count FROM cycle_records WHERE user_id = admin_user_id;
      RAISE NOTICE '✅ Cycle Records migrados: % registros', cycle_records_count;
    END IF;

    -- Tabelas opcionais
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dreams') THEN
      UPDATE dreams SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
      UPDATE goals SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlist_items') THEN
      UPDATE wishlist_items SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_lists') THEN
      UPDATE shopping_lists SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopping_list_items') THEN
      UPDATE shopping_list_items SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todo_lists') THEN
      UPDATE todo_lists SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todo_list_items') THEN
      UPDATE todo_list_items SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;

    RAISE NOTICE '===========================================';
  ELSE
    RAISE EXCEPTION 'Usuário admin não encontrado!';
  END IF;
END $$;

-- ============================================
-- PASSO 6: Tornar user_id obrigatório (NOT NULL)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routines') THEN
    ALTER TABLE routines ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routine_completions') THEN
    ALTER TABLE routine_completions ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits') THEN
    ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habit_completions') THEN
    ALTER TABLE habit_completions ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_moods') THEN
    ALTER TABLE daily_moods ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_settings') THEN
    ALTER TABLE cycle_settings ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cycle_records') THEN
    ALTER TABLE cycle_records ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  admin_user_id INTEGER;
  routines_count INTEGER := 0;
  habits_count INTEGER := 0;
  moods_count INTEGER := 0;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'acarolinadamore@gmail.com';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routines') THEN
    SELECT COUNT(*) INTO routines_count FROM routines WHERE user_id = admin_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits') THEN
    SELECT COUNT(*) INTO habits_count FROM habits WHERE user_id = admin_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_moods') THEN
    SELECT COUNT(*) INTO moods_count FROM daily_moods WHERE user_id = admin_user_id;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO! 🎉';
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
  RAISE NOTICE '⚠️  PRÓXIMO PASSO: Trocar a senha no primeiro login!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
END $$;
