# 💰 Finance — Sistema de Controle Financeiro e Produtividade Pessoal

Aplicação web completa para **gestão financeira pessoal e produtividade**, com controle de transações, rotinas, hábitos, humor, refeições, lista de compras, wishlist e muito mais.

---

## 📋 Módulos e Funcionalidades

### 💵 Finanças
- Controle completo de **entradas e saídas**
- **Categorias personalizáveis** com cores
- **Filtro por mês** e **reordenação por drag & drop**
- **Status de pagamento:** Pendente, Pago, Em Atraso
- Comparação de **valores reais vs. estimados**
- Suporte a **múltiplos cartões de crédito**
- **Gráficos de evolução anual**

### 🔄 Rotina
- **Gerenciamento de rotinas** diárias (manhã, tarde, noite)
- **Rastreamento de hábitos** com início/fim
- **Calendário de humor** com emoções e notas
- **Estatísticas e relatórios** de progresso
- **Grid mensal** com status de completude
- **Streaks** (sequências) de conclusão

### 🛒 Lista de Compras
- Lista de mercado com categorias
- Marcação de itens comprados
- Estimativa de gastos

### 🎁 Wishlist
- Lista de desejos com prioridades
- Acompanhamento de preços
- Link para produtos

### 🍽️ Refeições
- Registro de refeições diárias
- Relatórios nutricionais
- Planejamento de cardápio

### 🎯 Metas e Sonhos
- Definição de objetivos
- Acompanhamento de progresso
- Categorização por áreas

### 📚 Outros Módulos
- **Calendário** - Visão geral de eventos
- **Diário** - Registro de pensamentos
- **Leituras** - Lista de livros
- **Estudos** - Controle de cursos e materiais
- **Peso** - Acompanhamento de peso corporal
- **Documentos** - Organização de arquivos

---

## 🧱 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI reutilizáveis
- **Recharts** - Gráficos e visualizações
- **TanStack Query (React Query)** - Gerenciamento de estado servidor
- **React Router** - Roteamento
- **Sonner** - Toast notifications
- **date-fns** - Manipulação de datas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **pg** - Cliente PostgreSQL para Node.js
- **dotenv** - Variáveis de ambiente
- **cors** - Cross-origin resource sharing

---

## 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL** como banco de dados principal, com as seguintes tabelas:

- `transactions` - Transações financeiras
- `categories` - Categorias de transações
- `routines` - Rotinas diárias
- `routine_completions` - Conclusões de rotinas
- `habits` - Hábitos a serem rastreados
- `habit_completions` - Conclusões de hábitos
- `daily_moods` - Registro de humor diário
- `meals` - Refeições registradas

Consulte o arquivo `BANCO_DE_DADOS.md` para o schema completo.

---

## ⚙️ Como Executar o Projeto

### 1. Pré-requisitos

- **Node.js** 18+ instalado
- **PostgreSQL** instalado e rodando
- **pgAdmin** (opcional, para gerenciar o banco)

### 2. Clone o repositório

```bash
git clone https://github.com/acarolinadamore/finance.git
cd finance
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o banco de dados

**4.1. Crie o banco de dados no PostgreSQL:**

```sql
CREATE DATABASE finance;
```

**4.2. Execute o schema SQL:**

Abra o arquivo `BANCO_DE_DADOS.md`, copie o schema SQL e execute no **Query Tool** do pgAdmin ou via `psql`.

**4.3. Configure as variáveis de ambiente:**

O arquivo `.env` na raiz já está configurado. Se necessário, edite com suas credenciais:

```env
PORT=3032
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### 5. Inicie os servidores

**Terminal 1 - Backend:**

```bash
npm run backend
```
→ Servidor rodando em `http://localhost:3032`

**Terminal 2 - Frontend:**

```bash
npm run frontend
```
→ Aplicação disponível em `http://localhost:5173`

---

## 🔄 Migração de Dados (localStorage → PostgreSQL)

Se você já usava a aplicação com **localStorage** e deseja migrar para PostgreSQL:

### 1. Acesse a ferramenta de migração

```
http://localhost:5173/migration
```

### 2. Siga os passos na interface:

1. **Backup** - Faça backup dos dados do localStorage (recomendado)
2. **Migrar** - Clique em "Iniciar Migração" para transferir os dados
3. **Limpar** - Após confirmar que funcionou, limpe o localStorage (opcional)

### 3. Recarregue a página

Após a migração, todos os dados estarão no PostgreSQL e sincronizados automaticamente.

---

## 🧩 Estrutura do Projeto

```
finance/
├── finance/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── hooks/           # Custom hooks (React Query)
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilitários (migração, etc)
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Componente raiz
│   └── public/              # Assets estáticos
├── server/                  # Backend (Node.js + Express)
│   ├── index.js             # Servidor principal
│   └── .env                 # Configuração do servidor
├── .env                     # Configuração raiz
├── package.json             # Dependências e scripts
├── BANCO_DE_DADOS.md        # Schema PostgreSQL
└── README.md                # Este arquivo
```

---

## 💡 Recursos Técnicos

✅ **API REST completa** com 30+ endpoints
✅ **React Query** para cache e sincronização de dados
✅ **TypeScript** para type-safety no frontend
✅ **PostgreSQL** com constraints e triggers
✅ **Migração automática** de localStorage para banco
✅ **UI responsiva** com Tailwind CSS
✅ **Componentes reutilizáveis** com shadcn/ui
✅ **Drag & drop** para reordenação
✅ **Gráficos interativos** com Recharts
✅ **Toast notifications** para feedback instantâneo

---

## 📝 Scripts Disponíveis

```bash
npm run frontend      # Inicia o frontend (porta 5173)
npm run backend       # Inicia o backend (porta 3032)
npm run build         # Build de produção do frontend
```

---

## 🤝 Contribuição

Sinta-se à vontade para abrir **issues** e **pull requests** com sugestões e melhorias.

---

## 🪪 Licença

Este projeto é de uso pessoal e educativo.

© 2025 — Desenvolvido por **Ana Carolina d'Amore**
