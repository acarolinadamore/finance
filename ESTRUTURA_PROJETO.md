# 📁 ESTRUTURA DO PROJETO

## 🎯 VISÃO GERAL

```
finance/
├── finance/          # ✅ Projeto WEB (React + Vite)
├── mobile/           # 📱 Projeto MOBILE (Expo) - EM BREVE
├── server/           # 🔧 Backend (Express + PostgreSQL)
└── shared/           # 🔗 Código compartilhado (Web + Mobile)
```

---

## 📂 DETALHAMENTO

### `finance/` - Projeto Web

**Tecnologias:**

- React 18
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Shadcn/ui

**Estrutura:**

```
finance/
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas da aplicação
│   ├── hooks/        # Custom hooks
│   ├── services/     # API calls
│   └── types/        # ⚠️ MIGRAR PARA ../shared/types/
├── public/           # Assets estáticos
└── package.json
```

**Como rodar:**

```bash
cd finance
npm install
npm run dev
# Abre em http://localhost:8080
```

---

### `mobile/` - Projeto Mobile (EM DESENVOLVIMENTO)

**Tecnologias:**

- React Native
- Expo SDK 52
- Expo Router (navegação)
- TypeScript
- React Native Paper (UI)

**Estrutura (planejada):**

```
mobile/
├── app/              # Rotas (Expo Router)
│   ├── (auth)/       # Grupo: Autenticação
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/       # Grupo: Tabs principais
│   │   ├── home.tsx
│   │   ├── rotina.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx   # Layout raiz
├── components/       # Componentes mobile
├── hooks/            # Custom hooks
├── services/         # API calls (usa ../shared)
└── package.json
```

**Como rodar:**

```bash
cd mobile
npm install
npm start
# Pressione 'w' (web) ou 'a' (android)
```

---

### `server/` - Backend

**Tecnologias:**

- Node.js + Express
- PostgreSQL
- JWT (autenticação)
- bcrypt (senhas)

**Estrutura:**

```
server/
├── routes/           # Rotas da API
│   ├── auth.js       # /api/auth/*
│   └── admin.js      # /api/admin/*
├── middleware/       # Middlewares
│   └── auth.js       # JWT verification
├── index.js          # Servidor principal
└── .env              # Variáveis de ambiente
```

**Como rodar:**

```bash
cd server
npm install
node index.js
# Roda em http://localhost:3032
```

---

### `shared/` - Código Compartilhado ⭐ NOVO

**O que é:**
Código que pode ser usado tanto no **web** quanto no **mobile**.

**Estrutura:**

```
shared/
├── types/            # Tipos TypeScript
│   ├── user.ts       # interface User, LoginRequest, etc
│   ├── routine.ts    # interface Routine
│   ├── habit.ts      # interface Habit
│   └── index.ts      # Export tudo
├── utils/            # Utilitários
│   └── api.ts        # API_CONFIG, endpoints, helpers
├── index.ts          # Entry point
└── package.json
```

**Como usar:**

**No Web:**

```typescript
// Antes (❌ não usar mais)
interface User {
  id: number
  email: string
  // ...
}

// Depois (✅ usar shared)
import { User } from "../../../shared/types"
```

**No Mobile:**

```typescript
import { User, API_CONFIG } from "../../shared"
```

---

## 🔗 COMPARTILHAMENTO

### O que fica em `shared/`

✅ **Types/Interfaces**

- User, Routine, Habit
- Request/Response types
- Enums

✅ **Constantes**

- API URLs
- Endpoints
- Configurações

✅ **Utilitários puros**

- Validações
- Formatadores
- Helpers

### O que NÃO fica em `shared/`

❌ **Componentes UI**

- Web usa Shadcn/ui (React)
- Mobile usa React Native Paper
- São incompatíveis!

❌ **Navegação**

- Web usa React Router
- Mobile usa Expo Router

❌ **Storage**

- Web usa localStorage
- Mobile usa AsyncStorage

---

## 📊 FLUXO DE DADOS

```
┌─────────┐         ┌─────────┐
│   WEB   │         │ MOBILE  │
└────┬────┘         └────┬────┘
     │                   │
     │   import types    │
     │  from 'shared'    │
     │                   │
     ├───────┬───────────┤
             │
      ┌──────▼──────┐
      │   SHARED    │
      │   Types +   │
      │   Utils     │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │   SERVER    │
      │  (Backend)  │
      └─────────────┘
```

---

## 🚀 ROADMAP

### ✅ Fase 1: Preparação (CONCLUÍDO)

- [x] Criar pasta `shared/`
- [x] Criar tipos User, Routine, Habit
- [x] Criar utils API
- [x] Guia de testes mobile

### 📱 Fase 2: Setup Mobile (PRÓXIMO)

- [ ] Criar projeto Expo
- [ ] Configurar Expo Router
- [ ] Instalar dependências

### 🔐 Fase 3: Autenticação Mobile

- [ ] Tela de Login
- [ ] Tela de Registro
- [ ] AuthContext mobile
- [ ] Integrar com backend

### 🎯 Fase 4: Features Mobile

- [ ] Home (cards dos módulos)
- [ ] Rotina
- [ ] Calendário
- [ ] Ciclo Feminino

---

## 🔧 MANUTENÇÃO

### Adicionar novo tipo

1. Criar arquivo em `shared/types/`:

```typescript
// shared/types/goal.ts
export interface Goal {
  id: number
  user_id: number
  title: string
  // ...
}
```

2. Exportar em `shared/types/index.ts`:

```typescript
export * from "./goal"
```

3. Usar no web e mobile:

```typescript
import { Goal } from "../shared/types"
```

---

## 📝 CONVENÇÕES

### Nomenclatura

- **Types:** PascalCase (`User`, `Routine`)
- **Arquivos:** snake_case (`user.ts`, `api.ts`)
- **Constantes:** UPPER_CASE (`API_CONFIG`)

### Commits

- `feat(shared):` - Nova feature em shared
- `feat(web):` - Nova feature no web
- `feat(mobile):` - Nova feature no mobile
- `fix(server):` - Bug fix no backend

---

## 🎉 BENEFÍCIOS DESTA ESTRUTURA

✅ **Código reutilizado** - Types usados em web e mobile
✅ **Consistência** - Mesmos tipos garantem compatibilidade
✅ **Manutenção fácil** - Mudança em 1 lugar afeta ambos
✅ **Separação clara** - Cada projeto tem sua responsabilidade
✅ **Escalável** - Fácil adicionar mais plataformas (tablet, desktop app)

---

📚 **Documentação relacionada:**

- [GUIA_TESTES_MOBILE.md](./GUIA_TESTES_MOBILE.md) - Como testar mobile no desktop
- [SISTEMA_AUTENTICACAO.md](./SISTEMA_AUTENTICACAO.md) - Sistema de auth (web)
- [PAINEL_ADMIN.md](./PAINEL_ADMIN.md) - Painel admin (web)
