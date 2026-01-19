# 📋 Análise de Arquivos para Commit

## ❌ Arquivos que NÃO devem ir para o repositório

### 1. Configurações Locais
- ✅ `.claude/settings.local.json` - JÁ no .gitignore
- ❌ `finance/.claude/settings.local.json` - **PRECISA ADICIONAR** ao .gitignore

### 2. Package Lock
- ❌ `package-lock.json` - **REMOVER** do .gitignore
  - ⚠️ Este arquivo DEVE ir para o repositório para garantir versões consistentes!
  - Atualmente está sendo ignorado (linha 3 do .gitignore)

### 3. Scripts Temporários de Fix/Debug
Estes são scripts de uso único/debug que não precisam ir pro repo:
- ❌ `fix_daily_moods.sql`
- ❌ `fix_daily_moods_simple.sql`
- ❌ `fix_daily_moods_timestamps.sql`
- ❌ `server/check-habits-table.js`
- ❌ `server/check-latest-habit.js`
- ❌ `server/check-routines-schema.js`
- ❌ `server/check-table-correctly.js`
- ❌ `server/fix-goals-progress.js`
- ❌ `server/fix-todo-user-id.js`
- ❌ `server/fix-todo-user-id.sql`
- ❌ `server/fix-routine-type-column.sql`
- ❌ `server/add-cv-category.js`
- ❌ `server/add-photo-category.js`
- ❌ `server/run-update-romantica.js`
- ❌ `server/run-update-subscriptions.js`
- ❌ `server/update-romantica-categoria.sql`
- ❌ `server/update-subscriptions-nullable.sql`

### 4. Mobile - Node Modules
- ❌ `mobile/node_modules/` - Deve ter seu próprio .gitignore
- ❌ `mobile/package-lock.json` - Verificar se já está no .gitignore do mobile
- ❌ `mobile/.expo/` - Cache do Expo, não deve ir

---

## ✅ Arquivos que DEVEM ir para o repositório

### 1. Documentação
- ✅ `BANCO_DE_DADOS.md` (modificado)
- ✅ `ESTRUTURA_PROJETO.md` (novo)
- ✅ `GUIA_INTERCESSAO.md` (novo)
- ✅ `GUIA_TESTES_MOBILE.md` (novo)
- ✅ `INSTRUCOES_MIGRACAO_AUTH.md` (novo)
- ✅ `PAINEL_ADMIN.md` (novo)
- ✅ `SISTEMA_AUTENTICACAO.md` (novo)

### 2. Código Fonte - Componentes
- ✅ `finance/src/components/CreateCategoryDialog.tsx`
- ✅ `finance/src/components/DocumentViewerDialog.tsx`
- ✅ `finance/src/components/EditCategoryDialog.tsx`
- ✅ `finance/src/components/EditDocumentDialog.tsx`
- ✅ `finance/src/components/EditGoalDialog.tsx`
- ✅ `finance/src/components/ImportantDateDialog.tsx`
- ✅ `finance/src/components/LinkGoalsDialog.tsx`
- ✅ `finance/src/components/SubscriptionDialog.tsx`
- ✅ `finance/src/components/TagsFilter.tsx`
- ✅ `finance/src/components/UploadDocumentDialog.tsx`
- ✅ `finance/src/components/catolico/` (toda a pasta - inclui IntercessionsSection!)

### 3. Código Fonte - Páginas
- ✅ `finance/src/pages/Catolico.tsx`
- ✅ `finance/src/pages/CatolicoConfissoes.tsx`
- ✅ `finance/src/pages/CatolicoCoral.tsx`
- ✅ `finance/src/pages/CatolicoDuvidas.tsx`
- ✅ `finance/src/pages/CatolicoLectioDivina.tsx`
- ✅ `finance/src/pages/CatolicoLeituras.tsx`
- ✅ `finance/src/pages/CatolicoOracoes.tsx` (inclui nova aba Intercessão!)
- ✅ `finance/src/pages/CatolicoTerco.tsx`
- ✅ `finance/src/pages/CatolicoVersiculos.tsx`
- ✅ `finance/src/pages/DatasImportantes.tsx`
- ✅ `finance/src/pages/RodaDaVida.tsx`

### 4. Código Fonte - Hooks e Types
- ✅ `finance/src/hooks/useDocuments.ts`
- ✅ `finance/src/hooks/useImportantDates.ts`
- ✅ `finance/src/hooks/useSubscriptions.ts`
- ✅ `finance/src/hooks/useTags.ts`
- ✅ `finance/src/types/user.ts`

### 5. Backend - Servidor
- ✅ `server/index.js` (modificado - inclui correção de rotas!)
- ✅ `server/middleware/` (nova pasta)
- ✅ `server/routes/` (nova pasta - inclui rotas de intercessão!)

### 6. SQL - Schemas Iniciais (importantes para setup)
- ✅ `sql_auth_migration.sql`
- ✅ `sql_auth_migration_v2.sql`
- ✅ `sql_catolico.sql`
- ✅ `sql_catolico_completo.sql`
- ✅ `sql_ciclo_feminino.sql`
- ✅ `sql_duvidas.sql`
- ✅ `sql_duvidas_v2.sql`
- ✅ `sql_events.sql`
- ✅ `sql_intercessions.sql` ⭐ **NOVO - Intercessões!**
- ✅ `sql_intercessions_exemplos.sql` ⭐ **NOVO - Exemplos de Intercessões!**
- ✅ `sql_lectio_divina.sql`
- ✅ `sql_prayer_periods.sql`
- ✅ `sql_terco.sql`
- ✅ `sql_todo_lists.sql`
- ✅ `sql_versiculos.sql`

### 7. Scripts de Migração (úteis para setup inicial)
- ✅ `server/create-prayer-tables.js`
- ✅ `server/init-catolico-db.js`
- ✅ `server/init-cv-db.sql`
- ✅ `server/init-datas-importantes-db.sql`
- ✅ `server/init-documentos-db.sql`
- ✅ `server/init-dream-goals-relation.sql`
- ✅ `server/init-routines-db.sql`
- ✅ `server/init-subscriptions-db.sql`
- ✅ `server/init-tags-db.sql`
- ✅ `server/run-add-columns.js`
- ✅ `server/run-add-display-order-goals-dreams.js`
- ✅ `server/run-datas-importantes-migration.js`
- ✅ `server/run-documentos-migration.js`
- ✅ `server/run-dream-goals-migration.js`
- ✅ `server/run-fix-routine-type.js`
- ✅ `server/run-intercessions-migration.js` ⭐ **NOVO - Migração de Intercessões!**
- ✅ `server/run-routines-migration.js`
- ✅ `server/run-subscriptions-migration.js`
- ✅ `server/run-tags-migration.js`
- ✅ `server/run-terco-migration.js`
- ✅ `server/add-display-order-goals-dreams.sql`
- ✅ `server/add-display-order-routines.sql`
- ✅ `server/add-specific-days-column.sql`

### 8. Pasta Shared (código compartilhado)
- ✅ `shared/` (toda a pasta - tipos compartilhados entre web e mobile)

### 9. Pasta Mobile (projeto React Native)
- ✅ `mobile/` (SEM node_modules, .expo, etc)
  - Deve ter arquivos de código
  - Deve ter seu próprio .gitignore configurado

---

## 🔧 Ações Recomendadas

### 1. Atualizar .gitignore
Adicione as seguintes linhas ao `.gitignore` na raiz:

```gitignore
# Claude settings em subpastas
**/.claude/settings.local.json

# Scripts temporários de fix
fix_*.sql
fix_*.js
server/check-*.js
server/fix-*.js
server/fix-*.sql
server/update-*.sql
server/run-update-*.js
server/add-*-category.js

# Mobile
mobile/node_modules/
mobile/.expo/
mobile/package-lock.json

# Shared
shared/node_modules/
```

### 2. Remover package-lock.json do .gitignore
Edite o `.gitignore` e **REMOVA** a linha:
```
package-lock.json
```

O `package-lock.json` é importante para manter versões consistentes!

---

## 📊 Resumo

| Categoria | Deve Commitar? | Quantidade |
|-----------|----------------|------------|
| Configurações locais | ❌ NÃO | 2 |
| Scripts temporários | ❌ NÃO | ~15 |
| Documentação | ✅ SIM | 7 |
| Componentes React | ✅ SIM | ~25 |
| Páginas | ✅ SIM | ~20 |
| Backend | ✅ SIM | 3 pastas |
| SQL Schemas | ✅ SIM | ~17 |
| Scripts Migração | ✅ SIM | ~20 |
| Mobile/Shared | ✅ SIM | 2 pastas |

---

## 🎯 Próximos Passos

1. ✅ Atualizar .gitignore conforme sugerido acima
2. ✅ Adicionar arquivos corretos ao stage: `git add .` (após atualizar .gitignore)
3. ✅ Verificar: `git status` para confirmar
4. ✅ Criar commit descritivo
5. ✅ Push para repositório remoto

---

## 💡 Sugestão de Mensagem de Commit

```
feat: adiciona funcionalidade de Intercessão e corrige rotas

- Adiciona aba "Intercessão" em Orações Católicas com CRUD completo
- Corrige ordem de rotas no backend (reorder antes de :id)
- Adiciona autenticação em rotas DELETE de todo-lists
- Atualiza estilo visual de todos os cards de oração
- Traduz títulos para português (Offerings → Oferecimentos, etc)
- Adiciona tabela intercessions no banco de dados
- Cria rotas API para intercessões
- Adiciona componente IntercessionsSection com drag-and-drop

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```
