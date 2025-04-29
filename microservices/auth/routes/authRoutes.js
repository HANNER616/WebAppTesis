// routes/authRoutes.js

const express = require('express');
const { signup, login, passwordReset, updatePassword, verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/password-reset', passwordReset);
router.post('/update-password', updatePassword);
router.post('/verify-token', verifyToken);

module.exports = router;

