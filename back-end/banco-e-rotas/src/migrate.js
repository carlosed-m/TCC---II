const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function applyDatabaseMigration() {
    try {
        console.log('🔄 Aplicando migração do banco de dados...');
        
        // Ler o arquivo SQL de migração
        const sqlFile = path.join(__dirname, '../database/add_password_reset.sql');
        const sqlScript = fs.readFileSync(sqlFile, 'utf8');
        
        // Executar o script SQL
        await pool.query(sqlScript);
        
        console.log('✅ Migração aplicada com sucesso!');
        console.log('✅ Colunas reset_token e reset_token_expiry adicionadas à tabela users');
        
        // Verificar a estrutura da tabela
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Estrutura atual da tabela users:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error.message);
        if (error.message.includes('already exists')) {
            console.log('ℹ️  As colunas já existem - migração não necessária');
        }
    } finally {
        pool.end();
    }
}

// Executar a migração
applyDatabaseMigration();