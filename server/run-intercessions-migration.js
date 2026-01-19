const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const runMigration = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Executando migração de Intercessões...\n');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, '..', 'sql_intercessions.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Executar o SQL
    await client.query(sql);

    console.log('✅ Tabela intercessions criada com sucesso!');
    console.log('✅ Índices criados');
    console.log('✅ Triggers configurados');
    console.log('\n📊 Estrutura da tabela:');
    console.log('   - id: Identificador único');
    console.log('   - user_id: ID do usuário');
    console.log('   - title: Título da intercessão (personalizável)');
    console.log('   - content: Conteúdo da oração');
    console.log('   - display_order: Ordem de exibição');
    console.log('   - created_at: Data de criação');
    console.log('   - updated_at: Data de atualização\n');
    console.log('🎉 Migração concluída com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
