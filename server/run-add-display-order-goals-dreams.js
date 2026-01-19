const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'finance',
  user: 'postgres',
  password: 'postgres',
});

async function runMigration() {
  try {
    console.log('📝 Executando migração add-display-order-goals-dreams.sql...');

    const sqlPath = path.join(__dirname, 'add-display-order-goals-dreams.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migração executada com sucesso!');

    // Verificar se as colunas foram adicionadas
    const goalsCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'goals' AND column_name = 'display_order'
    `);

    const dreamsCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'dreams' AND column_name = 'display_order'
    `);

    console.log('📊 Verificação:');
    console.log('  - Coluna display_order em goals:', goalsCheck.rows.length > 0 ? 'OK' : 'FALTANDO');
    console.log('  - Coluna display_order em dreams:', dreamsCheck.rows.length > 0 ? 'OK' : 'FALTANDO');

    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
