const express = require('express');
const router = express.Router();
const evalController = require('../controllers/evalController');

// POST /eval - Remote Code Execution
router.post('/eval', evalController.executeCode);

module.exports = router;
