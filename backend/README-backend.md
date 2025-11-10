# VulnLab Backend - API Vulnerable

Backend de la aplicación VulnLab construido con Node.js, Express y SQLite3. Contiene **vulnerabilidades intencionales** para fines educativos.

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js (v14 o superior)
- npm (v6 o superior)

### Pasos de Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# O en modo desarrollo (con nodemon)
npm run dev
```

El servidor se ejecutará en **http://localhost:3000**

## 📊 Base de Datos

Se crea automáticamente un archivo `db.sqlite` con la siguiente estructura:

### Tabla: users

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Primary Key |
| username | TEXT | Nombre de usuario |
| password | TEXT | Contraseña (texto plano) |
| email | TEXT | Correo electrónico |
| role | TEXT | Rol (admin/user) |

### Usuarios de Prueba

| Username | Password | Role | ID |
|----------|----------|------|-----|
| admin | admin123 | admin | 1 |
| usuario | pass123 | user | 2 |
| test<script>alert("XSS")</script> | test123 | user | 3 |

## 🔓 Endpoints y Vulnerabilidades

### 1. POST /login - SQL Injection

**Vulnerabilidad:** Concatenación directa de inputs en query SQL

```bash
# Payload para bypass de autenticación
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' OR '\''1'\''='\''1", "password": "cualquiera"}'
```

**Mitigación:**
```javascript
// Usar prepared statements
db.get("SELECT * FROM users WHERE username = ? AND password = ?", 
       [username, password], callback);
```

---

### 2. GET /search?q=... - XSS Reflejado

**Vulnerabilidad:** El parámetro de búsqueda se refleja sin sanitización

```bash
# Payload XSS
curl "http://localhost:3000/search?q=<script>alert('XSS')</script>"
```

**Mitigación:**
- Sanitizar output con librerías como `DOMPurify`
- Usar `Content-Security-Policy` headers
- Escapar caracteres especiales HTML

---

### 3. GET /profile/:id - IDOR

**Vulnerabilidad:** Acceso a perfiles sin validación de autorización

```bash
# Ver perfil de admin sin autenticación
curl http://localhost:3000/profile/1

# Ver cualquier usuario
curl http://localhost:3000/profile/2
```

**Mitigación:**
- Implementar autenticación (JWT, sesiones)
- Verificar que el usuario solo acceda a su propio perfil
- Usar control de acceso basado en roles (RBAC)

---

### 4. GET /files?f=... - Directory Traversal

**Vulnerabilidad:** Path traversal permite leer archivos arbitrarios

```bash
# Leer server.js
curl "http://localhost:3000/files?f=../server.js"

# Leer package.json
curl "http://localhost:3000/files?f=../package.json"

# En Linux: leer /etc/passwd
curl "http://localhost:3000/files?f=../../../../etc/passwd"
```

**Mitigación:**
```javascript
// Validar y normalizar el path
const safePath = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
const fullPath = path.join(uploadsDir, safePath);

// Verificar que el path esté dentro del directorio permitido
if (!fullPath.startsWith(uploadsDir)) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

---

### 5. POST /upload - Insecure File Upload

**Vulnerabilidad:** Subida de archivos sin validación de tipo ni tamaño

```bash
# Subir archivo peligroso
curl -X POST http://localhost:3000/upload \
  -F "file=@malicious.php"
```

**Mitigación:**
```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'));
    }
    cb(null, true);
  }
});

// Renombrar archivos con UUID
filename: (req, file, cb) => {
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
  cb(null, uniqueName);
}
```

---

### 6. POST /eval - Remote Code Execution

**Vulnerabilidad:** Ejecución de código JavaScript arbitrario

```bash
# Ejecutar comandos del sistema
curl -X POST http://localhost:3000/eval \
  -H "Content-Type: application/json" \
  -d '{"code": "require('\''child_process'\'').execSync('\''whoami'\'').toString()"}'

# Leer archivos
curl -X POST http://localhost:3000/eval \
  -H "Content-Type: application/json" \
  -d '{"code": "require('\''fs'\'').readFileSync('\''package.json'\'', '\''utf8'\'')"}'
```

**Mitigación:**
- **NUNCA usar eval() con input del usuario**
- Usar sandboxing (vm2, isolated-vm)
- Implementar validación estricta
- Usar alternativas seguras según el caso de uso

---

### 7. GET /api/users - API sin Autenticación

**Vulnerabilidad:** Exposición de datos sensibles sin autenticación

```bash
# Obtener todos los usuarios con sus contraseñas
curl http://localhost:3000/api/users
```

**Mitigación:**
```javascript
// Implementar middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  // Nunca devolver contraseñas
  db.all(`SELECT id, username, email, role FROM users`, callback);
});
```

---

## 🛡️ Mitigaciones Generales

### 1. Seguridad de Base de Datos
- ✅ Usar prepared statements o ORMs (Sequelize, TypeORM)
- ✅ Hash de contraseñas con bcrypt
- ✅ Principio de mínimo privilegio para usuarios DB

### 2. Validación de Entrada
- ✅ Validar y sanitizar TODA entrada del usuario
- ✅ Usar librerías como `express-validator`, `joi`
- ✅ Implementar whitelisting sobre blacklisting

### 3. Seguridad HTTP
- ✅ Usar `helmet` para headers de seguridad
- ✅ Implementar CORS restrictivo
- ✅ Configurar CSP (Content-Security-Policy)
- ✅ Usar HTTPS en producción

### 4. Autenticación y Autorización
- ✅ Implementar JWT o sesiones seguras
- ✅ Usar cookies con flags `httpOnly` y `secure`
- ✅ Implementar RBAC (Role-Based Access Control)
- ✅ Rate limiting con `express-rate-limit`

### 5. Manejo de Archivos
- ✅ Validar tipo MIME y extensión
- ✅ Limitar tamaño de archivos
- ✅ Renombrar archivos subidos
- ✅ Escanear malware (ClamAV)
- ✅ Almacenar fuera del webroot

### 6. Logging y Monitoreo
- ✅ Implementar logging seguro (Winston, Bunyan)
- ✅ No loggear datos sensibles
- ✅ Monitorear intentos de ataque
- ✅ Implementar alertas de seguridad

## 📦 Dependencias

```json
{
  "express": "^4.18.2",        // Framework web
  "sqlite3": "^5.1.6",         // Base de datos
  "body-parser": "^1.20.2",    // Parser de body
  "multer": "^1.4.5-lts.1",    // Manejo de archivos
  "cors": "^2.8.5",            // CORS
  "cookie-parser": "^1.4.6"    // Parser de cookies
}
```

## ⚠️ Advertencias

1. **NO usar en producción** - Este código es intencionalmente inseguro
2. **Solo para laboratorio** - Ejecutar en ambiente aislado
3. **No exponer a internet** - Mantener en localhost
4. **Fines educativos** - Aprender a identificar y mitigar vulnerabilidades

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Última actualización:** 2025  
**Versión:** 1.0.0
