const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Importar configuración
const corsOptions = require('./config/cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const evalRoutes = require('./routes/evalRoutes');

const app = express();

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (para archivos subidos)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================
// RUTAS
// ============================================
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', fileRoutes);
app.use('/', evalRoutes);

// ============================================
// ENDPOINT DE PRUEBA
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'VulnLab Backend API - Entorno de Prueba de Vulnerabilidades',
    version: '1.0.0',
    warning: '⚠️  Esta API es INTENCIONALMENTE VULNERABLE - Solo para fines educativos',
    endpoints: {
      login: 'POST /login - SQL Injection vulnerable',
      search: 'GET /search?q=... - XSS Reflejado',
      profile: 'GET /profile/:id - IDOR',
      files: 'GET /files?f=... - Directory Traversal',
      upload: 'POST /upload - Insecure File Upload',
      eval: 'POST /eval - Remote Code Execution',
      users: 'GET /api/users - API sin autenticación'
    }
  });
});

module.exports = app;
