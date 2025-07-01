// routes/auditRoutes.js

const express = require('express');
const { logAlert, getByDateRange,getFrame } = require('../controllers/auditController');

const router = express.Router();

router.post('/alert', logAlert);
router.get('/show-alerts', getByDateRange);
router.get('/alerts/:id/frame', getFrame);


module.exports = router;

