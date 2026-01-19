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

async function runMigration() {
  try {
    console.log('🔄 Running routines migration...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init-routines-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Routines tables created successfully!');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
