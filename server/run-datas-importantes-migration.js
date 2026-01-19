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
    console.log('📅 Executando migração de Datas Importantes...');

    const sqlPath = path.join(__dirname, 'init-datas-importantes-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migração executada com sucesso!');

    // Verificar categorias criadas
    const categories = await pool.query('SELECT * FROM important_dates_categories ORDER BY display_order');
    console.log('\n📂 Categorias criadas:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.display_order}. ${cat.name} (${cat.icon}) - ${cat.color}`);
    });

    console.log('\n✅ Banco de dados pronto para uso!');
    console.log('📊 Estrutura criada:');
    console.log('  - important_dates_categories (categorias/áreas da vida)');
    console.log('  - important_dates (eventos e datas memoráveis)');
    console.log('  - important_dates_tags (relacionamento many-to-many)');
    console.log('  - important_dates_with_tags (view para consultas)');

    await pool.end();
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
