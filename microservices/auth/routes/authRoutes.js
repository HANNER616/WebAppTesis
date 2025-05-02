// routes/authRoutes.js

const express = require('express');
const { signup, login, passwordSendToken,updatePassword, updatePasswordReset, verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/password-send-token', passwordSendToken); // Cambié el nombre de la ruta a password-send-token
router.post('/password-reset', updatePasswordReset);
router.post('/update-password', updatePassword);
router.post('/verify-token', verifyToken);

module.exports = router;

