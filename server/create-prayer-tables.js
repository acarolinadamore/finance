const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Criando tabelas de períodos e categorias de oração...');

    // Tabela prayer_periods
    await client.query(`
      CREATE TABLE IF NOT EXISTS prayer_periods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        period VARCHAR(20) NOT NULL CHECK (period IN ('morning', 'afternoon', 'night')),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, period)
      );
    `);
    console.log('✅ Tabela prayer_periods criada');

    // Tabela prayer_categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS prayer_categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(20) NOT NULL CHECK (category IN ('novenas', 'ejaculations', 'penance', 'offerings')),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, category)
      );
    `);
    console.log('✅ Tabela prayer_categories criada');

    // Índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prayer_periods_user ON prayer_periods(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prayer_categories_user ON prayer_categories(user_id);
    `);
    console.log('✅ Índices criados');

    console.log('\n🎉 Tabelas criadas com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
