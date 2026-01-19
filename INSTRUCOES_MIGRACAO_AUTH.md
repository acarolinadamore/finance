# 📋 INSTRUÇÕES - MIGRAÇÃO PARA SISTEMA DE AUTENTICAÇÃO

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR

Este script vai:
1. ✅ Criar tabela de usuários (`users`)
2. ✅ Criar tabela para reset de senha (`password_resets`)
3. ✅ Criar seu usuário admin: **acarolinadamore@gmail.com**
4. ✅ Adicionar coluna `user_id` em TODAS as tabelas
5. ✅ Migrar TODOS os seus dados atuais para sua conta admin
6. ✅ Proteger os dados (cada usuário vê só o seu)

---

## 🚀 COMO EXECUTAR

### Passo 1: Abrir pgAdmin
1. Abra o **pgAdmin 4**
2. Conecte ao servidor PostgreSQL
3. Expanda: **Servers** → **PostgreSQL** → **Databases** → **finance**

### Passo 2: Abrir Query Tool
1. Clique com botão direito em **finance**
2. Selecione **Query Tool**

### Passo 3: Carregar o Script
1. No Query Tool, clique em **📂 Open File**
2. Navegue até: `C:\Users\anaca\dev\finance\sql_auth_migration.sql`
3. Clique em **Abrir**

### Passo 4: Executar o Script
1. Clique no botão **▶️ Execute/Refresh** (ou pressione F5)
2. Aguarde a execução (pode demorar 10-30 segundos)

### Passo 5: Verificar Resultado
Na aba **Messages**, você deve ver algo como:

```
NOTICE: Admin user ID: 1
NOTICE: Dados migrados para o usuário admin (ID: 1)
NOTICE: ===========================================
NOTICE: MIGRAÇÃO CONCLUÍDA COM SUCESSO!
NOTICE: ===========================================
NOTICE: Admin User ID: 1
NOTICE: Email: acarolinadamore@gmail.com
NOTICE: Senha temporária: admin123
NOTICE: -------------------------------------------
NOTICE: Dados migrados:
NOTICE:   - Rotinas: X registros
NOTICE:   - Hábitos: X registros
NOTICE:   - Moods: X registros
NOTICE: ===========================================
```

---

## 🔐 CREDENCIAIS INICIAIS

Após executar o script, use estas credenciais para fazer login:

- **Email:** acarolinadamore@gmail.com
- **Senha:** admin123

⚠️ **IMPORTANTE:** Troque esta senha no primeiro login!

---

## ✅ O QUE ACONTECEU?

### Tabelas Criadas:
- ✅ `users` - Usuários do sistema
- ✅ `password_resets` - Tokens para recuperação de senha

### Tabelas Modificadas (adicionado user_id):
- ✅ `routines` - Rotinas
- ✅ `routine_completions` - Completions de rotinas
- ✅ `habits` - Hábitos
- ✅ `habit_completions` - Completions de hábitos
- ✅ `daily_moods` - Registro de humor
- ✅ `cycle_settings` - Configurações do ciclo
- ✅ `cycle_records` - Registros do ciclo
- ✅ `events` - Eventos do calendário
- ✅ `dreams` - Sonhos
- ✅ `goals` - Metas
- ✅ `wishlist_items` - Wishlist
- ✅ `shopping_lists` - Listas de mercado
- ✅ `shopping_list_items` - Itens de lista de mercado
- ✅ `todo_lists` - Listas de tarefas
- ✅ `todo_list_items` - Itens de lista de tarefas

### Seus Dados:
✅ **TODOS os seus dados atuais foram migrados** para a conta **acarolinadamore@gmail.com**

---

## 🔄 PRÓXIMOS PASSOS

Depois de executar este script:

1. ✅ Me confirme que deu tudo certo
2. ✅ Vou implementar os endpoints de autenticação no backend
3. ✅ Vou criar as telas de login/registro no frontend
4. ✅ Você poderá fazer login e usar o sistema

---

## ❌ SE DER ERRO

Se aparecer algum erro:

1. **Copie a mensagem de erro completa**
2. **Me envie** para eu corrigir
3. **NÃO execute novamente** até eu revisar

---

## 🆘 BACKUP

Se quiser fazer backup antes (opcional mas recomendado):

1. Clique direito em **finance** database
2. Selecione **Backup...**
3. Escolha um local e nome: `finance_backup_antes_auth.sql`
4. Clique em **Backup**

Assim, se algo der errado, você pode restaurar.

---

## 📞 DÚVIDAS?

Me avise se tiver qualquer dúvida antes de executar!
