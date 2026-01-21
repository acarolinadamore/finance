-- Script para criar as tabelas de Acessos no PostgreSQL

-- Tabela de listas de acessos
CREATE TABLE IF NOT EXISTS access_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da lista de acessos
CREATE TABLE IF NOT EXISTS access_list_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL REFERENCES access_lists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    username VARCHAR(255),
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_access_list_items_list_id ON access_list_items(list_id);

-- Trigger para atualizar updated_at automaticamente (usa a função já existente)
DROP TRIGGER IF EXISTS update_access_lists_updated_at ON access_lists;
CREATE TRIGGER update_access_lists_updated_at
    BEFORE UPDATE ON access_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_list_items_updated_at ON access_list_items;
CREATE TRIGGER update_access_list_items_updated_at
    BEFORE UPDATE ON access_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
