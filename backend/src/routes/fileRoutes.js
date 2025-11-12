const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

// GET /files - Directory Traversal
router.get('/files', fileController.getFile);

// POST /upload - Insecure File Upload
router.post('/upload', upload.single('file'), fileController.uploadFile);

module.exports = router;
