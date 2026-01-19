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

async function initCatolicoDB() {
  try {
    console.log('Iniciando criação das tabelas do módulo Católico...');

    const sqlFile = fs.readFileSync(
      path.join(__dirname, '..', 'sql_catolico.sql'),
      'utf8'
    );

    await pool.query(sqlFile);

    console.log('✅ Tabelas do módulo Católico criadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
}

initCatolicoDB();
