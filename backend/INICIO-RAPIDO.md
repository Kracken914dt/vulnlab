# 🚀 Guía Rápida - Backend Reestructurado

## ⚡ Inicio Rápido

```bash
# En la carpeta backend
npm start
```

✅ Servidor corriendo en: **http://localhost:3000**

---


### ✅ **Estrutura**
```
backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Rutas HTTP
│   ├── middleware/      # Middlewares
│   └── app.js           # App Express
└── server.js            # Entry point
```

---

## 📍 Dónde Encontrar Cada Cosa

| ¿Qué necesitas? | Archivo |
|-----------------|---------|
| **Iniciar servidor** | `server.js` |
| **Configurar Express** | `src/app.js` |
| **Configurar base de datos** | `src/config/database.js` |
| **Configurar CORS** | `src/config/cors.js` |
| **Login (SQLi)** | `src/controllers/authController.js` |
| **Búsqueda (XSS)** | `src/controllers/userController.js` |
| **Upload (Insecure)** | `src/controllers/fileController.js` |
| **Eval (RCE)** | `src/controllers/evalController.js` |
| **Rutas de auth** | `src/routes/authRoutes.js` |
| **Config de Multer** | `src/middleware/upload.js` |

---

## 🛠️ Modificaciones Comunes

### **Cambiar el puerto:**
```javascript
// Edita: server.js
const PORT = process.env.PORT || 3001; // Cambiar aquí
```

### **Agregar origen CORS:**
```javascript
// Edita: src/config/cors.js
const corsOptions = {
  origin: 'http://localhost:5173', // Cambiar aquí
  credentials: true
};
```

### **Modificar ruta de uploads:**
```javascript
// Edita: src/middleware/upload.js
const uploadsDir = path.join(__dirname, '../../public/uploads');
```

### **Agregar usuarios de prueba:**
```javascript
// Edita: src/config/database.js
db.run(`INSERT OR IGNORE INTO users ... VALUES (...)`);
```

---

## ➕ Agregar Nueva Vulnerabilidad

**Ejemplo: Agregar CSRF**

### **1. Crear el controlador:**
```javascript
// src/controllers/csrfController.js
exports.transferMoney = (req, res) => {
  // Lógica vulnerable a CSRF
};
```

### **2. Crear las rutas:**
```javascript
// src/routes/csrfRoutes.js
const router = require('express').Router();
const csrfController = require('../controllers/csrfController');

router.post('/transfer', csrfController.transferMoney);

module.exports = router;
```

### **3. Registrar en app.js:**
```javascript
// src/app.js
const csrfRoutes = require('./routes/csrfRoutes');
app.use('/', csrfRoutes);
```

¡Listo! ✅

---

## 🧪 Probar Endpoints

### **Con cURL:**
```bash
# Login (SQLi)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Search (XSS)
curl "http://localhost:3000/search?q=admin"

# Profile (IDOR)
curl "http://localhost:3000/profile/1"

# Upload
curl -X POST http://localhost:3000/upload \
  -F "file=@test.txt"

# Eval (RCE)
curl -X POST http://localhost:3000/eval \
  -H "Content-Type: application/json" \
  -d '{"code":"2+2"}'
```

### **Con Postman/Insomnia:**
Importa esta colección base:
```json
{
  "name": "VulnLab API",
  "requests": [
    { "method": "POST", "url": "http://localhost:3000/login" },
    { "method": "GET", "url": "http://localhost:3000/search?q=admin" },
    { "method": "GET", "url": "http://localhost:3000/profile/1" },
    { "method": "POST", "url": "http://localhost:3000/upload" },
    { "method": "POST", "url": "http://localhost:3000/eval" }
  ]
}
```

---

## 📚 Documentación Completa

- 📖 **README-estructura.md** - Arquitectura detallada
- 🗺️ **ARQUITECTURA.md** - Diagramas y flujos
- 📊 **RESUMEN-REESTRUCTURACION.md** - Comparación antes/después
- 📋 **README-backend.md** - Documentación original

---

## 🔍 Debugging

### **Ver logs de base de datos:**
Los `console.log` están en cada controlador:
- `[SQLi] Query ejecutada:` en `authController.js`
- `[Path Traversal] Intentando leer:` en `fileController.js`
- `[Insecure Upload] Archivo subido:` en `fileController.js`
- `[RCE] Ejecutando código:` en `evalController.js`

### **Reiniciar servidor:**
```bash
# Si está en background
Ctrl + C en la terminal

# Volver a iniciar
npm start
```

---

## 🆘 Problemas Comunes

### **"Cannot find module './src/app'"**
→ Estás en la carpeta equivocada. Ejecuta desde `/backend`

### **"EADDRINUSE: address already in use"**
→ El puerto 3000 ya está ocupado:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **"SQLITE_ERROR: no such table: users"**
→ Elimina `db.sqlite` y reinicia el servidor

### **"CORS error" en el frontend**
→ Verifica que `src/config/cors.js` tenga el origen correcto

---

## ✅ Checklist de Funcionalidad

Verifica que todo funciona:
- [ ] Servidor inicia sin errores
- [ ] GET `/` devuelve la info de la API
- [ ] POST `/login` permite login
- [ ] GET `/search` devuelve resultados
- [ ] GET `/profile/:id` devuelve perfil
- [ ] GET `/files` lee archivos
- [ ] POST `/upload` sube archivos
- [ ] POST `/eval` ejecuta código
- [ ] GET `/api/users` lista usuarios

---

## 🎯 Ventajas de la Nueva Estructura

| Ventaja | Impacto |
|---------|---------|
| **Modular** | Fácil de entender y modificar |
| **Escalable** | Agregar features sin romper nada |
| **Testeable** | Pruebas unitarias por módulo |
| **Profesional** | Sigue estándares de la industria |
| **Educativa** | Cada vulnerabilidad aislada |

---

## 💡 Tips Finales

1. **Usa el backup:** `server-old.js` está disponible si algo falla
2. **Lee la documentación:** Los 3 archivos MD tienen info valiosa
3. **Explora los comentarios:** Cada archivo tiene explicaciones
4. **Compara versiones:** Mira las diferencias entre monolítico y modular

---

**¿Dudas?** Lee `ARQUITECTURA.md` para diagramas visuales y flujos completos.

**¿Quieres revertir?** Renombra `server-old.js` a `server.js`.

---

**Versión:** 2.0.0 (Modular)  
**Última actualización:** 11 noviembre 2025
