const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /login - SQL Injection vulnerable
router.post('/login', authController.login);

module.exports = router;
