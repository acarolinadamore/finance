-- Database Schema for Finance Application
-- Execute this script in pgAdmin after creating the database

-- Create ENUM types
CREATE TYPE account_type AS ENUM (
  'conta_corrente',
  'poupanca',
  'carteira',
  'investimento',
  'cartao_credito',
  'cartao_loja'
);

CREATE TYPE transaction_type AS ENUM ('entrada', 'saida');

CREATE TYPE transaction_status AS ENUM ('previsto', 'efetivado', 'cancelado');

CREATE TYPE payment_method AS ENUM (
  'pix',
  'cartao_credito',
  'cartao_debito',
  'boleto',
  'transferencia',
  'dinheiro',
  'ted_doc'
);

CREATE TYPE statement_status AS ENUM ('aberta', 'fechada', 'paga');

CREATE TYPE estimate_frequency AS ENUM ('once', 'monthly', 'weekly');

-- Table: accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  type account_type NOT NULL,
  opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  color VARCHAR(7),
  icon VARCHAR(50),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_income BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  nickname VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  issuer VARCHAR(255),
  closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  credit_limit DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: statements
CREATE TABLE statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  status statement_status NOT NULL DEFAULT 'aberta',
  closed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  fee_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id, year, month)
);

-- Table: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  statement_id UUID REFERENCES statements(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  note TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method payment_method,
  due_date DATE,
  effective_date DATE,
  competence VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  status transaction_status NOT NULL DEFAULT 'previsto',
  installment_total INTEGER,
  installment_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: recurring_templates
CREATE TABLE recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method payment_method,
  rrule TEXT NOT NULL, -- RFC 5545 RRULE format
  note TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: estimates
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  start_ym VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  months INTEGER,
  type transaction_type NOT NULL,
  frequency estimate_frequency NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  note TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_transactions_competence ON transactions(competence);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_statements_card ON statements(card_id);
CREATE INDEX idx_cards_account ON cards(account_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statements_updated_at BEFORE UPDATE ON statements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_templates_updated_at BEFORE UPDATE ON recurring_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories (matching the frontend initial data)
INSERT INTO categories (id, name, parent_id, is_income) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Moradia', NULL, FALSE),
  ('00000000-0000-0000-0000-000000000011', 'Energia', '00000000-0000-0000-0000-000000000001', FALSE),
  ('00000000-0000-0000-0000-000000000012', 'Internet', '00000000-0000-0000-0000-000000000001', FALSE),
  ('00000000-0000-0000-0000-000000000013', 'Aluguel/Condomínio', '00000000-0000-0000-0000-000000000001', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'Pessoais', NULL, FALSE),
  ('00000000-0000-0000-0000-000000000021', 'Mercado', '00000000-0000-0000-0000-000000000002', FALSE),
  ('00000000-0000-0000-0000-000000000022', 'Farmácia', '00000000-0000-0000-0000-000000000002', FALSE),
  ('00000000-0000-0000-0000-000000000003', 'Transporte', NULL, FALSE),
  ('00000000-0000-0000-0000-000000000031', 'Combustível', '00000000-0000-0000-0000-000000000003', FALSE),
  ('00000000-0000-0000-0000-000000000032', 'App de Transporte', '00000000-0000-0000-0000-000000000003', FALSE),
  ('00000000-0000-0000-0000-000000000004', 'Entradas', NULL, TRUE),
  ('00000000-0000-0000-0000-000000000041', 'Pensão Alimentícia', '00000000-0000-0000-0000-000000000004', TRUE),
  ('00000000-0000-0000-0000-000000000042', 'Ajuda de Custo', '00000000-0000-0000-0000-000000000004', TRUE),
  ('00000000-0000-0000-0000-000000000043', 'Salário', '00000000-0000-0000-0000-000000000004', TRUE),
  ('00000000-0000-0000-0000-000000000044', 'Reembolsos', '00000000-0000-0000-0000-000000000004', TRUE);
