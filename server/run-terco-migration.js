const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'finance_app',
  user: 'postgres',
  password: 'postgres'
});

async function runMigration() {
  console.log('🔄 Running terço migration...\n');

  try {
    const sqlPath = path.join(__dirname, '..', 'sql_terco.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Terço migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running terço migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
