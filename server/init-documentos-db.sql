-- Tabela de categorias de documentos
CREATE TABLE IF NOT EXISTS document_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Nome do ícone (FileText, Briefcase, Users, etc)
  color VARCHAR(7) DEFAULT '#6366f1',
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES document_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL, -- Nome original do arquivo
  file_type VARCHAR(50) NOT NULL, -- application/pdf, image/jpeg, etc
  file_size INTEGER, -- Tamanho em bytes
  file_data TEXT NOT NULL, -- Base64 do arquivo
  tags TEXT[], -- Array de tags para busca
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_updated_at_trigger ON documents;
CREATE TRIGGER documents_updated_at_trigger
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_documents_updated_at();

DROP TRIGGER IF EXISTS document_categories_updated_at_trigger ON document_categories;
CREATE TRIGGER document_categories_updated_at_trigger
BEFORE UPDATE ON document_categories
FOR EACH ROW
EXECUTE FUNCTION update_documents_updated_at();

-- Inserir categorias padrão
INSERT INTO document_categories (name, description, icon, color, display_order) VALUES
('Documentos Pessoais', 'RG, CPF, CNH, passaporte, certidões', 'User', '#3b82f6', 1),
('Documentos Familiares', 'Certidões de nascimento, identidade dos filhos', 'Users', '#10b981', 2),
('Contratos', 'Contratos de trabalho, prestação de serviços, aluguel', 'FileText', '#8b5cf6', 3),
('Documentos Legais', 'Procurações, contratos com advogado, documentos jurídicos', 'Scale', '#ef4444', 4),
('Saúde', 'Exames, receitas, cartões de vacinação', 'Heart', '#ec4899', 5),
('Financeiro', 'Comprovantes, notas fiscais, recibos', 'DollarSign', '#f59e0b', 6),
('Imóveis e Veículos', 'Documentos de propriedade, IPVA, IPTU', 'Home', '#06b6d4', 7),
('Outros', 'Documentos diversos', 'Folder', '#6b7280', 8)
ON CONFLICT DO NOTHING;
