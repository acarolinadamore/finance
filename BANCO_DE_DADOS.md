# 📊 Sistema de Armazenamento - Finance App

## Banco de Dados: PostgreSQL + localStorage (Híbrido)

Este projeto usa uma arquitetura híbrida:
- **PostgreSQL** para módulos principais (sincronização entre dispositivos)
- **localStorage** para alguns módulos legados (sendo migrados)

## 🗄️ Backend: Express.js + PostgreSQL

**Configuração:**
- Host: localhost
- Porta: 5432
- Database: finance
- API: http://localhost:3032/api

**Stack:**
- Express.js (servidor)
- pg (driver PostgreSQL)
- React Query (sincronização frontend)

## 📦 Módulos Conectados ao PostgreSQL

### 1. Finanças / Transações
- **Tabelas**: `transactions`, `categories`
- **Endpoints**: `/api/transactions`, `/api/categories`, `/api/summary`
- **Hook**: `useApiTransactions.ts`

### 2. Wishlist (Lista de Desejos)
- **Tabelas**: `wishlists`, `wishlist_items`, `wishlist_item_prices`
- **Endpoints**: `/api/wishlists`, `/api/wishlist-items`, `/api/wishlist-item-prices`
- **Hook**: `useWishlists.ts`

### 3. Shopping List (Lista de Compras)
- **Tabelas**: `shopping_lists`, `shopping_list_items`
- **Endpoints**: `/api/shopping-lists`, `/api/shopping-list-items`
- **Hook**: `useShoppingLists.ts`

### 4. Goals (Metas)
- **Tabelas**: `life_areas`, `goals`, `goal_tasks`
- **Endpoints**: `/api/life-areas`, `/api/goals`, `/api/goal-tasks`
- **Hook**: `useGoals.ts`

### 5. Dreams (Sonhos)
- **Tabelas**: `dreams`
- **Endpoints**: `/api/dreams`
- **Hook**: `useDreams.ts`

### 6. Routines (Rotinas) ⚠️ EM MIGRAÇÃO
- **Tabelas**: `routines`, `routine_completions`
- **Endpoints**: `/api/routines` (em desenvolvimento)
- **Hook**: `useRoutines.ts` (em migração)

### 7. Habits (Hábitos) ⚠️ EM MIGRAÇÃO
- **Tabelas**: `habits`, `habit_completions`
- **Endpoints**: `/api/habits` (em desenvolvimento)
- **Hook**: `useHabits.ts` (em migração)

### 8. Mood (Humor Diário) ⚠️ EM MIGRAÇÃO
- **Tabelas**: `daily_moods`
- **Endpoints**: `/api/moods` (em desenvolvimento)
- **Hook**: `useMood.ts` (em migração)

### 9. Cycle (Ciclo Feminino)
- **Tabelas**: `cycle_settings`, `cycle_records`
- **Endpoints**: `/api/cycle-settings`, `/api/cycle-records`, `/api/cycle-stats`
- **Hook**: `useCycle.ts`

## 📱 Módulos em localStorage (Legado)

### Chaves de Armazenamento Temporárias:

1. **`routines-data`** - Rotinas (migrando para PostgreSQL)
2. **`routine-completions-data`** - Completions das rotinas
3. **`habits-data-v1`** - Hábitos (migrando para PostgreSQL)
4. **`habit-completions-v1`** - Completions dos hábitos
5. **`daily-mood-data-v2`** - Humor diário (migrando para PostgreSQL)
6. **`meals-data`** - Refeições (próxima migração)

## 🔍 Como Visualizar os Dados

### Via PostgreSQL (pgAdmin ou Query Tools):

```sql
-- Ver todas as transações
SELECT * FROM transactions ORDER BY date DESC;

-- Ver todas as rotinas
SELECT * FROM routines WHERE is_active = true;

-- Ver hábitos e seus completions
SELECT h.name, COUNT(hc.id) as completions
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
GROUP BY h.id, h.name;

-- Ver humor dos últimos 7 dias
SELECT * FROM daily_moods
WHERE mood_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY mood_date DESC;
```

### Via API REST (Thunder Client, Postman, etc):

```bash
# Listar transações
GET http://localhost:3032/api/transactions

# Listar rotinas
GET http://localhost:3032/api/routines

# Listar hábitos
GET http://localhost:3032/api/habits

# Criar novo hábito
POST http://localhost:3032/api/habits
Content-Type: application/json
{
  "name": "Meditar",
  "frequency": "daily",
  "startDate": "2025-11-10"
}
```

### Via localStorage (dados legados - temporário):

```javascript
// Ver todas as rotinas (legado)
JSON.parse(localStorage.getItem('routines-data'))

// Ver todos os hábitos (legado)
JSON.parse(localStorage.getItem('habits-data-v1'))

// Ver registros de humor (legado)
JSON.parse(localStorage.getItem('daily-mood-data-v2'))
```

## 🧹 Como Limpar os Dados

### Via PostgreSQL:
```sql
-- CUIDADO: Apaga TODOS os dados do banco!
TRUNCATE TABLE transactions, categories,
  wishlists, wishlist_items,
  shopping_lists, shopping_list_items,
  routines, routine_completions,
  habits, habit_completions,
  daily_moods, meals,
  goals, goal_tasks,
  dreams, life_areas
RESTART IDENTITY CASCADE;
```

### Via localStorage (dados legados):
```javascript
// Limpar tudo do localStorage
localStorage.clear()
location.reload()

// Limpar apenas hábitos
localStorage.removeItem('habits-data-v1')
localStorage.removeItem('habit-completions-v1')
location.reload()

// Limpar apenas rotinas
localStorage.removeItem('routines-data')
localStorage.removeItem('routine-completions-data')
location.reload()
```

## 📁 Estrutura de Arquivos

### Backend (server/):
- `server/index.js` - API Express com todos os endpoints
- `.env` - Configurações do banco de dados

### Frontend (finance/src/):

**Hooks com PostgreSQL:**
- `hooks/useApiTransactions.ts` - Transações
- `hooks/useWishlists.ts` - Wishlist
- `hooks/useShoppingLists.ts` - Shopping List
- `hooks/useGoals.ts` - Metas
- `hooks/useDreams.ts` - Sonhos

**Hooks em Migração (localStorage → PostgreSQL):**
- `hooks/useRoutines.ts` - Rotinas (em migração)
- `hooks/useHabits.ts` - Hábitos (em migração)
- `hooks/useMood.ts` - Humor (em migração)

**Hooks localStorage (aguardando migração):**
- `hooks/useMeals.ts` - Refeições

**Services:**
- `services/api.ts` - Funções de comunicação com backend

## 🔧 Estrutura de um Hábito:

```typescript
{
  id: string,                    // UUID gerado automaticamente
  routineId?: string,            // ID da rotina vinculada (opcional)
  name: string,                  // Nome do hábito
  period: 'morning' | 'afternoon' | 'night',
  frequency: 'daily' | 'weekly' | 'custom',
  specificDays?: number[],       // [0,1,2,3,4,5,6] para dias da semana
  timesPerWeek?: number,         // Quantas vezes por semana
  startDate: string,             // 'YYYY-MM-DD'
  endDate?: string,              // 'YYYY-MM-DD' (opcional)
  icon?: string,                 // Emoji
  color: string,                 // Cor em hex
  isActive: boolean,             // Se está ativo ou arquivado
  createdAt: string,             // ISO timestamp
  updatedAt: string              // ISO timestamp
}
```

## 🔧 Estrutura de um Completion:

```typescript
{
  id: string,                    // UUID
  habitId: string,               // ID do hábito
  completionDate: string,        // 'YYYY-MM-DD'
  completed: boolean,            // true/false
  createdAt: string              // ISO timestamp
}
```

## 🚀 Backup e Migração de Dados

### Backup PostgreSQL:
```bash
# Exportar banco completo
pg_dump -U postgres -d finance > backup_finance.sql

# Restaurar backup
psql -U postgres -d finance < backup_finance.sql
```

### Backup localStorage (antes de migrar):
```javascript
// Exportar dados do localStorage
const backup = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  backup[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(backup));
// Copie e salve o JSON em um arquivo
```

### Migração localStorage → PostgreSQL:

**Script de Migração** (executar no console do navegador após backend estar rodando):

```javascript
// 1. Migrar Rotinas
const routines = JSON.parse(localStorage.getItem('routines-data') || '[]');
const routineCompletions = JSON.parse(localStorage.getItem('routine-completions-data') || '[]');

for (const routine of routines) {
  await fetch('http://localhost:3032/api/routines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine)
  });
}

// 2. Migrar Hábitos
const habits = JSON.parse(localStorage.getItem('habits-data-v1') || '[]');
const habitCompletions = JSON.parse(localStorage.getItem('habit-completions-v1') || '[]');

for (const habit of habits) {
  await fetch('http://localhost:3032/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit)
  });
}

// 3. Migrar Humor
const moods = JSON.parse(localStorage.getItem('daily-mood-data-v2') || '[]');

for (const mood of moods) {
  await fetch('http://localhost:3032/api/moods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mood)
  });
}

console.log('✅ Migração concluída!');
```

## ✅ Vantagens do PostgreSQL

**vs localStorage:**
- ✅ Sincronização entre dispositivos
- ✅ Backup automático e seguro
- ✅ Não há limite de armazenamento
- ✅ Queries complexas e relatórios
- ✅ Integridade referencial
- ✅ Performance superior
- ✅ Histórico de mudanças
- ✅ Não perde dados ao limpar cache do navegador

## 🔧 Como Rodar o Projeto

### 1. Iniciar Backend:
```bash
cd C:\Users\anaca\dev\finance
npm install
npm start
# Backend rodará em http://localhost:3032
```

### 2. Iniciar Frontend:
```bash
cd C:\Users\anaca\dev\finance\finance
npm install
npm run dev
# Frontend rodará em http://localhost:5173
```

### 3. Verificar Conexão:
```bash
# Testar se API está respondendo
curl http://localhost:3032/api/transactions
```

## 📊 Status da Migração

- ✅ **Finanças** - Migrado
- ✅ **Wishlist** - Migrado
- ✅ **Shopping List** - Migrado
- ✅ **Goals** - Migrado
- ✅ **Dreams** - Migrado
- ✅ **Routines** - Migrado
- ✅ **Habits** - Migrado
- ✅ **Mood** - Migrado
- ✅ **Cycle** - Implementado
- ⏳ **Meals** - Aguardando migração

---

## 🩸 Schema SQL - Ciclo Feminino

```sql
-- Tabela de configurações do ciclo (uma única linha por usuário)
CREATE TABLE IF NOT EXISTS cycle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_period_start_date DATE NOT NULL,
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  luteal_phase_length INTEGER DEFAULT 14,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de registros diários do ciclo
-- NOTA: O humor é registrado na tabela daily_moods (integrado com módulo Humor existente)
CREATE TABLE IF NOT EXISTS cycle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date DATE NOT NULL UNIQUE,
  flow_level VARCHAR(20) CHECK (flow_level IN ('none', 'light', 'moderate', 'heavy')),
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_cycle_records_date ON cycle_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_records_flow ON cycle_records(flow_level);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cycle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cycle_settings_updated_at
  BEFORE UPDATE ON cycle_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_cycle_updated_at();

CREATE TRIGGER cycle_records_updated_at
  BEFORE UPDATE ON cycle_records
  FOR EACH ROW
  EXECUTE FUNCTION update_cycle_updated_at();

-- Inserir configurações padrão (se não existir)
INSERT INTO cycle_settings (last_period_start_date, average_cycle_length, average_period_length, luteal_phase_length)
VALUES (CURRENT_DATE, 28, 5, 14)
ON CONFLICT DO NOTHING;
```

### Sintomas Disponíveis:

```typescript
const SYMPTOMS = [
  'cólica',
  'dor de cabeça',
  'enxaqueca',
  'acne',
  'inchaço',
  'dor lombar',
  'sensibilidade nos seios',
  'alterações intestinais',
  'constipação',
  'diarreia',
  'desejo por doce',
  'desejo por salgado',
  'irritabilidade',
  'tristeza',
  'ansiedade',
  'energia baixa',
  'energia alta',
  'insônia',
  'sonolência',
  'náusea',
  'tontura',
  'cansaço extremo',
  'libido aumentada',
  'libido diminuída'
];
```
