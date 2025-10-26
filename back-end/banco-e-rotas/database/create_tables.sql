-- Script SQL para criação das tabelas
-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de histórico de verificações
CREATE TABLE IF NOT EXISTS verification_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('url', 'file')),
    target VARCHAR(500) NOT NULL, -- URL ou nome do arquivo verificado
    result JSONB NOT NULL, -- Resultado completo da análise do VirusTotal em JSON
    status VARCHAR(50) NOT NULL, -- Status da verificação (clean, malicious, suspicious, etc.)
    threat_count INTEGER DEFAULT 0, -- Número de engines que detectaram ameaças
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criação de índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON verification_history(created_at);
CREATE INDEX IF NOT EXISTS idx_history_type ON verification_history(type);

-- Inserir um usuário de teste (opcional)
INSERT INTO users (name, email, password) VALUES 
('Admin', 'admin@tcc.com', '$2a$10$example.hash.for.testing.only')
ON CONFLICT (email) DO NOTHING;

-- Comentários das tabelas
COMMENT ON TABLE users IS 'Tabela para armazenar dados dos usuários do sistema';
COMMENT ON TABLE verification_history IS 'Tabela para armazenar histórico das verificações de URLs e arquivos';

COMMENT ON COLUMN users.password IS 'Senha criptografada com bcrypt';
COMMENT ON COLUMN verification_history.result IS 'Resultado completo da API do VirusTotal em formato JSON';
COMMENT ON COLUMN verification_history.target IS 'URL verificada ou nome do arquivo enviado';
COMMENT ON COLUMN verification_history.threat_count IS 'Número de antivírus que detectaram ameaças';