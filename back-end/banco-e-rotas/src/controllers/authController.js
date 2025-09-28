const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Chave secreta JWT - em produção, use variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'tcc_jwt_secret_key_2024';

// Registrar novo usuário
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validações básicas
        if (!name || !email || !password) {
            return res.status(400).json({ 
                erro: 'Dados obrigatórios', 
                detalhe: 'Nome, email e senha são obrigatórios' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                erro: 'Senha muito curta', 
                detalhe: 'A senha deve ter pelo menos 6 caracteres' 
            });
        }

        // Verificar se usuário já existe
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ 
                erro: 'Email já cadastrado', 
                detalhe: 'Este email já está sendo utilizado por outro usuário' 
            });
        }

        // Criptografar senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserir usuário no banco
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // Gerar token JWT
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                created_at: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível cadastrar o usuário' 
        });
    }
};

// Login de usuário
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validações básicas
        if (!email || !password) {
            return res.status(400).json({ 
                erro: 'Dados obrigatórios', 
                detalhe: 'Email e senha são obrigatórios' 
            });
        }

        // Buscar usuário no banco
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                erro: 'Credenciais inválidas', 
                detalhe: 'Email ou senha incorretos' 
            });
        }

        const user = result.rows[0];

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                erro: 'Credenciais inválidas', 
                detalhe: 'Email ou senha incorretos' 
            });
        }

        // Atualizar último login
        await pool.query(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', 
            [user.id]
        );

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível realizar o login' 
        });
    }
};

// Verificar token JWT
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                erro: 'Token não fornecido', 
                detalhe: 'Token de autorização é obrigatório' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1', 
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                erro: 'Token inválido', 
                detalhe: 'Usuário não encontrado' 
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(401).json({ 
            erro: 'Token inválido', 
            detalhe: 'Token expirado ou malformado' 
        });
    }
};