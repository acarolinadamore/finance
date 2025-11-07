# 💰 Finance — Sistema de Controle Financeiro Pessoal

Aplicação web para **gestão financeira pessoal**, permitindo controle de transações, categorias e cartões de crédito com interface moderna e intuitiva.

---

## 📋 Funcionalidades Principais

### 💵 Transações

- Controle completo de **entradas e saídas**
- **Cards de resumo** com valores reais e estimados
- **Categorias personalizáveis** com cores
- **Filtro por mês** e **reordenação por drag & drop**
- **Status de pagamento:** Pendente, Pago, Em Atraso
- Planejamento de **valores estimados**

### 💳 Cartões de Crédito

- **Comparação mensal** de gastos
- **Gráfico de evolução anual**
- **Resumo por cartão e total geral**
- **Edição inline** de valores mensais
- Suporte a **múltiplos cartões**

---

## 🧱 Tecnologias

### Frontend

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Recharts**
- **TanStack Query**
- **Zustand**
- **React Router**

### Backend

- **Node.js + Express**
- **PostgreSQL** (gerenciado via pgAdmin)
- **pg** (cliente PostgreSQL)

---

## ⚙️ Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/acarolinadamore/finance.git
cd finance
2. Instale as dependências
bash
Copiar código
npm install
3. Inicie os servidores
Em dois terminais separados:

Frontend
bash
Copiar código
npm run frontend
→ disponível em http://localhost:3031

Backend
bash
Copiar código
npm run backend
→ disponível em http://localhost:3032

🧩 Estrutura do Projeto
csharp
Copiar código
finance/
├── src/              # Frontend (React)
│   ├── components/
│   ├── pages/
│   ├── store/
│   └── services/
├── server/           # Backend (Node.js + Express)
├── public/           # Arquivos estáticos
└── package.json
💡 Recursos Técnicos
Persistência de estado local e servidor

Comunicação com API REST

Organização modular de componentes

Suporte a drag & drop, gráficos e tabelas dinâmicas

🤝 Contribuição
Sinta-se à vontade para abrir issues e pull requests com sugestões e melhorias.

🪪 Licença
Este projeto é de uso pessoal e educativo.
© 2025 — Desenvolvido por Ana Carolina d’Amore
```
