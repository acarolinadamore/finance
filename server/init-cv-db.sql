-- Tabela de dados pessoais do CV
CREATE TABLE IF NOT EXISTS cv_personal_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Para futura integração com usuários
  full_name VARCHAR(255) NOT NULL,
  professional_title VARCHAR(255), -- Ex: "Desenvolvedor Full Stack", "Engenheiro de Software"
  email VARCHAR(255),
  phone VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  linkedin VARCHAR(255),
  github VARCHAR(255),
  portfolio VARCHAR(255),
  photo_data TEXT, -- Base64 da foto
  summary TEXT, -- Resumo profissional/objetivo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de experiências profissionais
CREATE TABLE IF NOT EXISTS cv_experiences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL se ainda trabalha lá
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements TEXT[], -- Array de conquistas/realizações
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de formação acadêmica
CREATE TABLE IF NOT EXISTS cv_education (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL, -- Ex: "Bacharelado", "Mestrado", "Técnico"
  field_of_study VARCHAR(255), -- Ex: "Ciência da Computação"
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  grade VARCHAR(50), -- Ex: "9.5", "Cum Laude"
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de habilidades/competências
CREATE TABLE IF NOT EXISTS cv_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  category VARCHAR(100), -- Ex: "Linguagens", "Frameworks", "Ferramentas", "Soft Skills"
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50), -- Ex: "Básico", "Intermediário", "Avançado", "Fluente"
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de idiomas
CREATE TABLE IF NOT EXISTS cv_languages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  language VARCHAR(100) NOT NULL,
  proficiency VARCHAR(50) NOT NULL, -- Ex: "Nativo", "Fluente", "Avançado", "Intermediário", "Básico"
  certifications TEXT, -- Certificados como TOEFL, IELTS, etc
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cursos e certificações
CREATE TABLE IF NOT EXISTS cv_certifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255),
  issue_date DATE,
  expiration_date DATE,
  credential_id VARCHAR(255),
  credential_url VARCHAR(255),
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS cv_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  technologies TEXT[], -- Array de tecnologias usadas
  url VARCHAR(255),
  github_url VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_cv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cv_personal_info_updated_at_trigger ON cv_personal_info;
CREATE TRIGGER cv_personal_info_updated_at_trigger
BEFORE UPDATE ON cv_personal_info
FOR EACH ROW
EXECUTE FUNCTION update_cv_updated_at();

DROP TRIGGER IF EXISTS cv_experiences_updated_at_trigger ON cv_experiences;
CREATE TRIGGER cv_experiences_updated_at_trigger
BEFORE UPDATE ON cv_experiences
FOR EACH ROW
EXECUTE FUNCTION update_cv_updated_at();

DROP TRIGGER IF EXISTS cv_education_updated_at_trigger ON cv_education;
CREATE TRIGGER cv_education_updated_at_trigger
BEFORE UPDATE ON cv_education
FOR EACH ROW
EXECUTE FUNCTION update_cv_updated_at();

DROP TRIGGER IF EXISTS cv_certifications_updated_at_trigger ON cv_certifications;
CREATE TRIGGER cv_certifications_updated_at_trigger
BEFORE UPDATE ON cv_certifications
FOR EACH ROW
EXECUTE FUNCTION update_cv_updated_at();

DROP TRIGGER IF EXISTS cv_projects_updated_at_trigger ON cv_projects;
CREATE TRIGGER cv_projects_updated_at_trigger
BEFORE UPDATE ON cv_projects
FOR EACH ROW
EXECUTE FUNCTION update_cv_updated_at();

-- Inserir dados pessoais padrão (caso não exista)
INSERT INTO cv_personal_info (full_name, professional_title, summary)
VALUES (
  'Seu Nome Completo',
  'Seu Título Profissional',
  'Escreva aqui um breve resumo sobre você, suas experiências e objetivos profissionais.'
)
ON CONFLICT DO NOTHING;
