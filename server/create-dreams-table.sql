-- Criar tabela dreams (sonhos)
CREATE TABLE IF NOT EXISTS dreams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT, -- Suporta URL ou base64 (data:image/...)
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_dreams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dreams_updated_at_trigger ON dreams;

CREATE TRIGGER dreams_updated_at_trigger
BEFORE UPDATE ON dreams
FOR EACH ROW
EXECUTE FUNCTION update_dreams_updated_at();
