const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /search - XSS Reflejado
router.get('/search', userController.searchUsers);

// GET /profile/:id - IDOR
router.get('/profile/:id', userController.getUserProfile);

// GET /api/users - API sin autenticación
router.get('/api/users', userController.getAllUsers);

module.exports = router;
