const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg'); // Importa o módulo pg para conexão com o PostgreSQL

// Configurações de conexão com o banco de dados
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'TccII', // Nome correto do seu banco
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Teste da conexão ao inicializar
pool.on('connect', () => {
    console.log('✅ Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão com PostgreSQL:', err);
});

// Exporta o pool para ser utilizado em outros arquivos
module.exports = pool;