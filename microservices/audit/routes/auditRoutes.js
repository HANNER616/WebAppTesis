// routes/auditRoutes.js

const express = require('express');
const { createExamSession, logAlert, getByDateRange,getFrame } = require('../controllers/auditController');
const authenticateJWT = require('../middleware/authenticateJWT'); 

const router = express.Router();

router.post('/alert', authenticateJWT, logAlert);
router.post('/exam-session', authenticateJWT,createExamSession);
router.get('/show-alerts', authenticateJWT,getByDateRange);
router.get('/alerts/:id/frame',authenticateJWT, getFrame);




module.exports = router;

