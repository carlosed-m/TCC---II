const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

// Chave secreta JWT
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

        // Buscar o usuário no banco
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

        // Atualiza o último login
        await pool.query(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', 
            [user.id]
        );

        // Gera o token JWT
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

// Verificar o token JWT
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

// Verificar se e-mail já existe para recuperação
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'E-mail é obrigatório' 
            });
        }

        // Verificar se o usuário existe
        const userResult = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'E-mail não encontrado em nossos registros.'
            });
        }

        const user = userResult.rows[0];
        
        // Gerar um código simples de recuperação baseado no ID e timestamp
        const resetCode = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        const resetCodeExpiry = new Date(Date.now() + 1800000); // 30 minutos

        // Salvar código no banco
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [resetCode, resetCodeExpiry, user.id]
        );

        console.log(`✅ Código de recuperação gerado para: ${email}`);
        console.log(`📧 Usuário: ${user.name}`);
        console.log(`🔑 Código expira em: ${resetCodeExpiry.toLocaleString()}`);

        res.json({
            success: true,
            message: 'E-mail verificado! Redirecionando para redefinição de senha...',
            resetCode: resetCode,
            userName: user.name
        });

    } catch (error) {
        console.error('Erro ao verificar e-mail:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor' 
        });
    }
};

// Redefinir senha
exports.resetPassword = async (req, res) => {
    try {
        const { code, newPassword } = req.body;

        if (!code || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Código e nova senha são obrigatórios' 
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false,
                message: 'A senha deve ter pelo menos 8 caracteres' 
            });
        }

        // Validar formato da senha
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                success: false,
                message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial' 
            });
        }

        // Buscar usuário pelo código
        const userResult = await pool.query(
            'SELECT id, email, name FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [code]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Código inválido ou expirado. Solicite uma nova recuperação.' 
            });
        }

        const user = userResult.rows[0];

        // Criptografar nova senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Atualizar senha e limpar código
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        console.log(`✅ Senha redefinida com sucesso para: ${user.email} (${user.name})`);

        res.json({
            success: true,
            message: 'Senha redefinida com sucesso! Você pode fazer login agora.',
            userName: user.name
        });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor' 
        });
    }
};