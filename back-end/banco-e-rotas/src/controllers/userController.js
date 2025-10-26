const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Obter o perfil do usuário logado
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Vem do middleware de autenticação

        const result = await pool.query(
            'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário solicitado não existe' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível buscar o perfil do usuário' 
        });
    }
};

// Atualizar o perfil do usuário
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        // Validações básicas
        if (!name || !email) {
            return res.status(400).json({ 
                erro: 'Dados obrigatórios', 
                detalhe: 'Nome e email são obrigatórios' 
            });
        }

        // Verificar se o novo email já está em uso por outro usuário
        if (email) {
            const emailExists = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );

            if (emailExists.rows.length > 0) {
                return res.status(400).json({ 
                    erro: 'Email já em uso', 
                    detalhe: 'Este email já está sendo usado por outro usuário' 
                });
            }
        }

        // Atualizar os dados do usuário
        const result = await pool.query(
            `UPDATE users 
             SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING id, name, email, created_at, updated_at`,
            [name, email, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário solicitado não existe' 
            });
        }

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível atualizar o perfil' 
        });
    }
};

// Alterar a senha do usuário
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Validações básicas
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                erro: 'Dados obrigatórios', 
                detalhe: 'Senha atual e nova senha são obrigatórias' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                erro: 'Senha muito curta', 
                detalhe: 'A nova senha deve ter pelo menos 6 caracteres' 
            });
        }

        // Buscar o usuário atual
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário solicitado não existe' 
            });
        }

        const user = userResult.rows[0];

        // Verificar a senha atual
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                erro: 'Senha atual incorreta', 
                detalhe: 'A senha atual fornecida está incorreta' 
            });
        }

        // Criptografar a nova senha
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Atualizar a senha no banco
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível alterar a senha' 
        });
    }
};

// Deletar a conta do usuário
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        // Validar a senha antes de deletar
        if (!password) {
            return res.status(400).json({ 
                erro: 'Senha obrigatória', 
                detalhe: 'É necessário confirmar a senha para deletar a conta' 
            });
        }

        // Buscar o usuário
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário solicitado não existe' 
            });
        }

        const user = userResult.rows[0];

        // Verificar a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                erro: 'Senha incorreta', 
                detalhe: 'A senha fornecida está incorreta' 
            });
        }

        // Deletar o usuário (Cascade deletará o histórico automaticamente)
        const deleteResult = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado', 
                detalhe: 'O usuário solicitado não existe' 
            });
        }

        res.json({
            success: true,
            message: 'Conta deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor', 
            detalhe: 'Não foi possível deletar a conta' 
        });
    }
};