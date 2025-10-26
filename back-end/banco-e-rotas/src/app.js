//=======================================================
// API principal com PostgreSQL, autenticação JWT,
// histórico de verificações e geração dos relatórios PDF
//

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Teste de conexão com banco
const pool = require('./config/db');

// --- Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001; // API Backend

// Middlewares globais
app.use(cors({
    origin: [
        'http://localhost:3000',  // Frontend
        'http://127.0.0.1:3000',  // Frontend alternativo
        'http://localhost:5500',  // Live Server
        'http://127.0.0.1:5500',  // Live Server alternativo
        'http://localhost:5501',  // Caso use outra porta
        'http://localhost:8080',  // Outras portas comuns
        'null'                    // Para arquivos locais
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log para desenvolvimento
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// --- Importação das Rotas ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');

// --- Registro das Rotas ---
// Rota de status da API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API do TCC funcionando corretamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas dos usuários
app.use('/api/users', userRoutes);

// Rotas do histórico
app.use('/api/history', historyRoutes);

// Middleware de tratamento das rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        detalhe: `A rota ${req.method} ${req.originalUrl} não existe`
    });
});

// Middleware de tratamento dos erros globais
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhe: 'Ocorreu um erro inesperado'
    });
});

// Teste de conexão com o banco na inicialização
const testDatabaseConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    } catch (error) {
        console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
        console.error('Verifique se:');
        console.error('- PostgreSQL está rodando');
        console.error('- Banco "tcc_database" foi criado');
        console.error('- Credenciais em db.js estão corretas');
    }
};

// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor API rodando em http://localhost:${PORT}`);
    console.log(`📊 Status da API: http://localhost:${PORT}/api/status`);
    testDatabaseConnection();
});