// routes/auditRoutes.js

const express = require('express');
const { createExamSession,getAlertsPaginated, logAlert, getAllByUser,getFrame } = require('../controllers/auditController');
const authenticateJWT = require('../middleware/authenticateJWT'); 

const router = express.Router();

router.post('/alert', authenticateJWT, logAlert);
router.post('/exam-session', authenticateJWT,createExamSession);
router.get('/get-alerts', authenticateJWT,getAllByUser);
router.get('/alerts/:id/frame',authenticateJWT, getFrame);
router.get('/get-alerts-limited', authenticateJWT, getAlertsPaginated); 




module.exports = router;

