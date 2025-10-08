const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rota para salvar uma nova verificação no histórico
// POST /api/history
// Headers: { Authorization: "Bearer TOKEN" }
// Body: { type, target, result, status, threat_count }
router.post('/', authenticateToken, historyController.saveVerification);

// Rota para obter histórico do usuário logado
// GET /api/history?page=1&limit=10&type=url
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/', authenticateToken, historyController.getUserHistory);

// Rota para obter estatísticas do usuário
// GET /api/history/stats/user
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/stats/user', authenticateToken, historyController.getUserStats);

// Rota para obter detalhes de uma verificação específica
// GET /api/history/:id
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/:id', authenticateToken, historyController.getVerificationDetails);

// Rota para gerar PDF de uma verificação específica
// GET /api/history/:id/pdf
// Headers: { Authorization: "Bearer TOKEN" }
router.get('/:id/pdf', authenticateToken, historyController.generateVerificationPDF);

// Rota para gerar PDF temporário (sem salvar no histórico)
// POST /api/history/generate-pdf
// Body: { type, target, result, status, threat_count, scan_date }
router.post('/generate-pdf', historyController.generateTemporaryPDF);

// Rota para deletar uma verificação do histórico
// DELETE /api/history/:id
// Headers: { Authorization: "Bearer TOKEN" }
router.delete('/:id', authenticateToken, historyController.deleteVerification);

module.exports = router;