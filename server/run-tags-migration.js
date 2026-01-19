const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'finance',
  password: 'postgres',
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migração de tags...');

    const sql = fs.readFileSync(
      path.join(__dirname, 'init-tags-db.sql'),
      'utf8'
    );

    await client.query(sql);

    console.log('✓ Tabelas de tags criadas com sucesso!');
    console.log('✓ Tags padrão inseridas!');

  } catch (error) {
    console.error('Erro na migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
