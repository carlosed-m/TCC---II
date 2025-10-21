-- Script de migração para adicionar funcionalidade de recuperação de senha
-- Execute este script se você já tem a tabela users criada

-- Adicionar colunas para recuperação de senha (se não existirem)
DO $$ 
BEGIN
    -- Verificar se a coluna reset_token existe, se não, criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token') THEN
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
    END IF;
    
    -- Verificar se a coluna reset_token_expiry existe, se não, criar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token_expiry') THEN
        ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP NULL;
    END IF;
END $$;

-- Criar índice na coluna reset_token para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

-- Verificar a estrutura da tabela após as alterações
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;