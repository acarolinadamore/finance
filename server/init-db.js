const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDatabase() {
  try {
    console.log('Criando tabela transactions...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tabela transactions criada com sucesso!');

    // Inserir dados de exemplo
    console.log('Inserindo dados de exemplo...');

    await pool.query(`
      INSERT INTO transactions (date, description, category, amount, type)
      VALUES
        ('2025-01-05', 'Salário', 'Salário', 5000.00, 'income'),
        ('2025-01-06', 'Supermercado', 'Alimentação', 350.00, 'expense'),
        ('2025-01-07', 'Freelance', 'Trabalho Extra', 1200.00, 'income'),
        ('2025-01-08', 'Aluguel', 'Moradia', 1500.00, 'expense'),
        ('2025-01-09', 'Luz', 'Contas', 150.00, 'expense')
      ON CONFLICT DO NOTHING
    `);

    console.log('Dados de exemplo inseridos com sucesso!');
    console.log('Banco de dados inicializado!');

    await pool.end();
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase();
