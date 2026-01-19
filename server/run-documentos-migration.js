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
    console.log('📝 Executando migração de documentos...');

    const sqlPath = path.join(__dirname, 'init-documentos-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migração executada com sucesso!');

    // Verificar categorias criadas
    const categories = await pool.query('SELECT * FROM document_categories ORDER BY display_order');
    console.log('\n📂 Categorias criadas:');
    categories.rows.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.icon})`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
