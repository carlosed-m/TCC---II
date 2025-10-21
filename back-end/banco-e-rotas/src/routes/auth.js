const express = require('express');
const { register, login, verifyToken, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para registro de novo usuário
// POST /api/auth/register
// Body: { name, email, password }
router.post('/register', register);

// Rota para login de usuário
// POST /api/auth/login  
// Body: { email, password }
router.post('/login', login);

// Rota para verificar se o token JWT é válido
// GET /api/auth/verify
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/verify', verifyToken);

// Rota para solicitar recuperação de senha
// POST /api/auth/forgot-password
// Body: { email }
router.post('/forgot-password', forgotPassword);

// Rota para redefinir senha
// POST /api/auth/reset-password
// Body: { token, newPassword }
router.post('/reset-password', resetPassword);

// Rota para logout (opcional - pode ser implementada no frontend)
// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
    // Em uma implementação completa, você poderia invalidar o token
    // Por agora, apenas retorna uma mensagem de sucesso
    res.json({
        success: true,
        message: 'Logout realizado com sucesso'
    });
});

module.exports = router;