const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ============================================
// VULNERABILIDAD: CORS Permisivo
// ============================================
// Permitir CUALQUIER origen puede exponer la API a ataques CSRF y acceso no autorizado
// MITIGACIÓN: Usar una whitelist de orígenes permitidos:
// app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cors({
  origin: '*', // ¡PELIGRO! Permite cualquier origen
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (para archivos subidos)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================
// Configuración de Base de Datos SQLite
// ============================================
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('✓ Conectado a la base de datos SQLite');
    initDatabase();
  }
});

function initDatabase() {
  // Crear tabla de usuarios con datos de ejemplo
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user'
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla users:', err);
    } else {
      // Insertar usuarios de prueba
      db.run(`
        INSERT OR IGNORE INTO users (id, username, password, email, role)
        VALUES 
          (1, 'admin', 'admin123', 'admin@vulnlab.com', 'admin'),
          (2, 'usuario', 'pass123', 'usuario@vulnlab.com', 'user'),
          (3, 'test<script>alert("XSS")</script>', 'test123', 'test@vulnlab.com', 'user')
      `);
      console.log('✓ Tabla users inicializada con datos de prueba');
    }
  });
}

// ============================================
// ENDPOINT 1: LOGIN CON SQL INJECTION
// ============================================
// VULNERABILIDAD: SQL Injection por concatenación directa
// El input del usuario se concatena directamente en la query sin sanitización
// PAYLOAD DE PRUEBA: username: admin' OR '1'='1 , password: cualquier cosa
// MITIGACIÓN: Usar prepared statements con placeholders:
// db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], ...)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // CONCATENACIÓN PELIGROSA - ¡SQLi vulnerable!
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('[SQLi] Query ejecutada:', query);
  
  db.get(query, (err, user) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Error en la base de datos',
        details: err.message // Exponer detalles del error también es peligroso
      });
    }
    
    if (user) {
      // Establecer cookie de sesión (insegura, sin httpOnly ni secure)
      res.cookie('user', user.username, { 
        maxAge: 3600000,
        httpOnly: false, // VULNERABILIDAD: Cookie accesible desde JavaScript
        secure: false // VULNERABILIDAD: Cookie enviada sobre HTTP
      });
      
      return res.json({ 
        success: true, 
        message: 'Login exitoso',
        user: user // Exponiendo datos completos del usuario
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Credenciales inválidas' 
    });
  });
});

// ============================================
// ENDPOINT 2: BÚSQUEDA CON XSS REFLEJADO
// ============================================
// VULNERABILIDAD: Reflected XSS
// El parámetro de búsqueda se devuelve sin sanitización
// PAYLOAD DE PRUEBA: /search?q=<script>alert('XSS')</script>
// MITIGACIÓN: Sanitizar el output o devolver solo JSON (que el frontend escape)
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  
  // Búsqueda simulada en la base de datos
  db.all(`SELECT * FROM users WHERE username LIKE '%${query}%'`, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // VULNERABILIDAD: Devolver el query sin escape para que el frontend lo muestre
    res.json({
      query: query, // Sin sanitizar - el frontend usará dangerouslySetInnerHTML
      results: results || [],
      count: results ? results.length : 0
    });
  });
});

// ============================================
// ENDPOINT 3: PERFIL CON IDOR
// ============================================
// VULNERABILIDAD: IDOR (Insecure Direct Object Reference)
// Cualquiera puede acceder al perfil de cualquier usuario sin autenticación
// PAYLOAD DE PRUEBA: /profile/1 (ver admin), /profile/2 (ver otro usuario)
// MITIGACIÓN: Verificar que el usuario autenticado solo pueda ver su propio perfil
app.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  
  // Sin verificar autenticación ni autorización
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Devolver todos los datos del usuario (incluyendo password - ¡gravísimo!)
    res.json(user);
  });
});

// ============================================
// ENDPOINT 4: DIRECTORY TRAVERSAL
// ============================================
// VULNERABILIDAD: Path Traversal / Directory Traversal
// Permite leer archivos arbitrarios del sistema usando ../
// PAYLOAD DE PRUEBA: /files?f=../../../etc/passwd (Linux) o /files?f=../server.js
// MITIGACIÓN: Validar y sanitizar el path, usar whitelist de archivos permitidos
app.get('/files', (req, res) => {
  const filename = req.query.f || '';
  
  // PELIGRO: Construcción directa del path sin validación
  const filePath = path.join(__dirname, 'public', 'uploads', filename);
  
  console.log('[Path Traversal] Intentando leer:', filePath);
  
  // Leer archivo sin validación
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        details: err.message,
        path: filePath // Exponer el path completo es un information disclosure
      });
    }
    
    res.send(data);
  });
});

// ============================================
// ENDPOINT 5: INSECURE FILE UPLOAD
// ============================================
// VULNERABILIDAD: Subida de archivos sin validación
// Permite subir cualquier tipo de archivo (PHP, ejecutables, etc.)
// PAYLOAD DE PRUEBA: Subir un archivo shell.php o malware.exe
// MITIGACIÓN: Validar extensión, MIME type, tamaño, renombrar archivos, escanear malware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // VULNERABILIDAD: Mantener el nombre original del archivo
    // Permite sobrescribir archivos y usar nombres maliciosos
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage
  // SIN LÍMITES: Sin fileFilter, sin límite de tamaño, sin validación
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }
  
  console.log('[Insecure Upload] Archivo subido:', req.file.filename);
  
  res.json({
    success: true,
    message: 'Archivo subido exitosamente',
    filename: req.file.filename,
    url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// ============================================
// ENDPOINT 6: REMOTE CODE EXECUTION
// ============================================
// VULNERABILIDAD: RCE mediante eval()
// Ejecuta código JavaScript arbitrario del usuario
// PAYLOAD DE PRUEBA: code: require('child_process').execSync('whoami').toString()
// MITIGACIÓN: NUNCA usar eval() con input del usuario, usar sandboxing o vm2
app.post('/eval', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Falta el parámetro "code"' });
  }
  
  try {
    console.log('[RCE] Ejecutando código:', code);
    
    // ¡EXTREMADAMENTE PELIGROSO!
    const result = eval(code);
    
    res.json({
      success: true,
      input: code,
      output: result,
      type: typeof result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack // Exponer el stack trace
    });
  }
});

// ============================================
// ENDPOINT 7: API SIN AUTENTICACIÓN
// ============================================
// VULNERABILIDAD: Exposición de datos sensibles sin autenticación
// Cualquiera puede ver la lista completa de usuarios con sus datos
// MITIGACIÓN: Implementar autenticación JWT/session y autorización
app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users`, (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Devolver TODOS los usuarios con TODOS sus datos (incluyendo passwords)
    res.json({
      count: users.length,
      users: users // ¡Incluyendo contraseñas en texto plano!
    });
  });
});

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

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║           VulnLab Backend Server                       ║
║                                                        ║
║  🚀 Servidor corriendo en http://localhost:${PORT}    ║
║  ⚠️  ENTORNO VULNERABLE - Solo para educación         ║
║                                                        ║
║  Endpoints disponibles:                               ║
║  • POST /login          (SQL Injection)               ║
║  • GET  /search         (XSS Reflejado)               ║
║  • GET  /profile/:id    (IDOR)                        ║
║  • GET  /files?f=...    (Path Traversal)              ║
║  • POST /upload         (Insecure Upload)             ║
║  • POST /eval           (RCE)                         ║
║  • GET  /api/users      (Sin Auth)                    ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\nCerrando servidor y base de datos...');
  db.close();
  process.exit(0);
});
