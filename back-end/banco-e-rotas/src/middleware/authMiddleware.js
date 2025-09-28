const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Chave secreta JWT - deve ser a mesma usada no authController
const JWT_SECRET = process.env.JWT_SECRET || 'tcc_jwt_secret_key_2024';

// Middleware para verificar autenticação JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Buscar token no header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                erro: 'Token não fornecido', 
                detalhe: 'É necessário estar logado para acessar este recurso' 
            });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verificar se o usuário ainda existe no banco
        const userResult = await pool.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário associado ao token não existe' 
            });
        }

        // Adicionar informações do usuário ao request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            userInfo: userResult.rows[0]
        };

        next();

    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                erro: 'Token inválido', 
                detalhe: 'O token fornecido é inválido' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                erro: 'Token expirado', 
                detalhe: 'O token fornecido expirou. Faça login novamente' 
            });
        }

        return res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Erro na verificação de autenticação' 
        });
    }
};

// Middleware opcional - permite acesso com ou sem token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userResult = await pool.query(
                'SELECT id, name, email FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (userResult.rows.length > 0) {
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    userInfo: userResult.rows[0]
                };
            }
        }

        next();

    } catch (error) {
        // Em caso de erro, continue sem autenticação
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};