-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  contract_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('mensal', 'trimestral', 'anual')),
  next_charge_date DATE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('TV', 'Relacionamento', 'Profissional', 'Saúde', 'Educação', 'Software', 'Streaming', 'Outro')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_charge_date ON subscriptions(next_charge_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();
