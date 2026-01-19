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
    console.log('Iniciando migração de relacionamento sonhos-metas...');

    const sql = fs.readFileSync(
      path.join(__dirname, 'init-dream-goals-relation.sql'),
      'utf8'
    );

    await client.query(sql);

    console.log('✓ Tabela dream_goals criada com sucesso!');

  } catch (error) {
    console.error('Erro na migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
