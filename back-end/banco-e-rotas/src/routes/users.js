const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rota para obter perfil do usuário logado
// GET /api/users/profile
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/profile', authenticateToken, userController.getProfile);

// Rota para atualizar perfil do usuário logado
// PUT /api/users/profile
// Headers: { Authorization: "Bearer TOKEN" }
// Body: { name, email }
router.put('/profile', authenticateToken, userController.updateProfile);

// Rota para alterar senha do usuário
// PUT /api/users/change-password
// Headers: { Authorization: "Bearer TOKEN" }
// Body: { currentPassword, newPassword }
router.put('/change-password', authenticateToken, userController.changePassword);

// Rota para deletar conta do usuário
// DELETE /api/users/account
// Headers: { Authorization: "Bearer TOKEN" }
// Body: { password }
router.delete('/account', authenticateToken, userController.deleteAccount);

module.exports = router;