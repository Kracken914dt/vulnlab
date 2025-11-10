# VulnLab Frontend - React + Vite

Frontend de la aplicación VulnLab construido con React 18, Vite y React Router. Interfaz web que consume el backend vulnerable para demostrar múltiples vulnerabilidades de seguridad.

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js (v14 o superior)
- npm (v6 o superior)
- Backend corriendo en `http://localhost:3000`

### Pasos de Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

La aplicación se ejecutará en **http://localhost:5173**

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── main.jsx           # Punto de entrada
│   ├── App.jsx            # Componente principal con Router
│   ├── App.css            # Estilos globales
│   ├── api.js             # Cliente HTTP para comunicación con backend
│   └── pages/             # Páginas de la aplicación
│       ├── Home.jsx       # Inicio y lista de usuarios
│       ├── Login.jsx      # Login con SQL Injection
│       ├── Search.jsx     # Búsqueda con XSS Reflejado
│       ├── Profile.jsx    # Perfiles con IDOR + XSS
│       ├── Upload.jsx     # Subida de archivos insegura
│       └── Eval.jsx       # Ejecución de código (RCE)
├── index.html             # HTML base
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
└── README-frontend.md     # Este archivo
```

## 🎯 Páginas y Vulnerabilidades

### 1. Home (`/`)
- **Descripción:** Página de inicio con información del proyecto
- **Vulnerabilidad:** Expone la API de usuarios sin autenticación
- **Endpoint:** `GET /api/users`
- **Aprendizaje:** API pública exponiendo datos sensibles

### 2. Login (`/login`)
- **Descripción:** Formulario de inicio de sesión
- **Vulnerabilidad:** SQL Injection en el backend
- **Endpoint:** `POST /login`
- **Payloads de ejemplo:**
  - `admin' OR '1'='1` (bypass)
  - `admin'--` (comentario SQL)
- **Aprendizaje:** Cómo explotar SQLi y cómo prevenirla con prepared statements

### 3. Search (`/search`)
- **Descripción:** Búsqueda de usuarios
- **Vulnerabilidad:** XSS Reflejado (Reflected XSS)
- **Endpoint:** `GET /search?q=...`
- **Código vulnerable:**
```jsx
// VULNERABILIDAD: dangerouslySetInnerHTML permite XSS
<span dangerouslySetInnerHTML={{ __html: results.query }} />
```
- **Payloads de ejemplo:**
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror=alert('XSS')>`
  - `<svg onload=alert('XSS')>`
- **Aprendizaje:** Cómo XSS puede robar cookies y ejecutar código malicioso

### 4. Profile (`/profile/:id`)
- **Descripción:** Visualización de perfiles de usuario
- **Vulnerabilidades:** 
  - IDOR (Insecure Direct Object Reference)
  - XSS Almacenado (Stored XSS)
- **Endpoint:** `GET /profile/:id`
- **Pruebas:**
  - Acceder a `/profile/1` (admin)
  - Acceder a `/profile/2` (usuario)
  - Acceder a `/profile/3` (contiene XSS)
- **Código vulnerable:**
```jsx
// Sin validación de autorización + XSS
<span dangerouslySetInnerHTML={{ __html: profile.username }} />
```
- **Aprendizaje:** Control de acceso y sanitización de datos

### 5. Upload (`/upload`)
- **Descripción:** Subida de archivos
- **Vulnerabilidad:** Insecure File Upload
- **Endpoint:** `POST /upload`
- **Problemas:**
  - Sin validación de tipo de archivo
  - Sin límite de tamaño
  - Mantiene nombre original (posible sobrescritura)
  - Archivos accesibles públicamente
- **Escenarios de ataque:**
  - Subir web shells (.php, .jsp)
  - Subir HTML con XSS
  - Subir ejecutables maliciosos
  - DoS con archivos grandes
- **Aprendizaje:** Validación de archivos y manejo seguro de uploads

### 6. Eval (`/eval`)
- **Descripción:** Ejecución de código JavaScript
- **Vulnerabilidad:** Remote Code Execution (RCE)
- **Endpoint:** `POST /eval`
- **Payloads de ejemplo:**
  - `process.cwd()` (path del servidor)
  - `process.env` (variables de entorno)
  - `require('child_process').execSync('whoami').toString()` (ejecutar comandos)
  - `require('fs').readFileSync('package.json', 'utf8')` (leer archivos)
- **Aprendizaje:** Peligros de eval() y sandboxing seguro

## 🔧 Características Técnicas

### React Router
El proyecto usa React Router v6 para la navegación:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/search" element={<Search />} />
  <Route path="/profile/:id" element={<Profile />} />
  <Route path="/upload" element={<Upload />} />
  <Route path="/eval" element={<Eval />} />
</Routes>
```

### API Client (`api.js`)
Centraliza todas las llamadas al backend:

```javascript
const API_BASE_URL = 'http://localhost:3000';

export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  return response.json();
};
```

### Estilos
- CSS moderno con gradientes y sombras
- Diseño responsive
- Componentes reutilizables (cards, alerts, forms)
- Tema oscuro para navbar y footer
- Syntax highlighting para code blocks

## 🔓 Vulnerabilidades Implementadas (Frontend)

### 1. dangerouslySetInnerHTML
**Ubicación:** `Search.jsx`, `Profile.jsx`

```jsx
// VULNERABILIDAD: Permite XSS
<span dangerouslySetInnerHTML={{ __html: unsafeContent }} />
```

**Mitigación:**
```jsx
// Opción 1: Usar renderizado normal de React
<span>{safeContent}</span>

// Opción 2: Sanitizar con DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(unsafeContent);
<span dangerouslySetInnerHTML={{ __html: clean }} />
```

### 2. Falta de Validación Cliente
Los formularios no validan formato ni contenido antes de enviar al backend.

**Mitigación:**
- Validar inputs con regex
- Usar librerías como Yup o Joi
- Implementar validación de tipos
- Sanitizar datos antes de enviar

### 3. Exposición de Errores
Se muestran mensajes de error completos del backend al usuario.

**Mitigación:**
- Mostrar mensajes genéricos al usuario
- Loggear errores detallados en servidor
- No exponer stack traces

### 4. Sin Manejo de Autenticación
No hay verificación de sesión activa ni protección de rutas.

**Mitigación:**
- Implementar Context API para auth
- Proteger rutas con HOCs o middleware
- Verificar tokens en cada request
- Implementar logout y refresh de tokens

## 🛡️ Mejores Prácticas de Seguridad (Frontend)

### 1. Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

### 2. Sanitización de Inputs
```javascript
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

### 3. Validación de Formularios
```javascript
import * as Yup from 'yup';

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo alfanuméricos y guión bajo')
    .required('Campo requerido'),
  password: Yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .required('Campo requerido')
});
```

### 4. Manejo Seguro de Tokens
```javascript
// Almacenar JWT en httpOnly cookie (backend)
// NO en localStorage (vulnerable a XSS)

// Si usas localStorage, al menos cifra:
import CryptoJS from 'crypto-js';

const encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, SECRET).toString();
};

const decryptToken = (encrypted) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 5. HTTPS Only
```javascript
// En producción, forzar HTTPS
if (location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## 📚 Recursos de Aprendizaje

### React Security
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [OWASP React Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html)

### Frontend Security General
- [OWASP Frontend Security](https://owasp.org/www-project-web-security-testing-guide/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [SameSite Cookies](https://web.dev/samesite-cookies-explained/)

### Herramientas de Seguridad
- **ESLint Security Plugin:** Detectar código inseguro
- **npm audit:** Encontrar vulnerabilidades en dependencias
- **Snyk:** Monitoreo continuo de vulnerabilidades
- **OWASP ZAP:** Escaneo de vulnerabilidades web

## 🔍 Testing de Vulnerabilidades

### 1. Probar XSS Manualmente
1. Ir a `/search`
2. Ingresar: `<script>alert(document.cookie)</script>`
3. Observar ejecución del script

### 2. Probar IDOR
1. Ir a `/profile/1`
2. Cambiar URL a `/profile/2`, `/profile/3`
3. Observar acceso a otros perfiles

### 3. Verificar CORS
```javascript
// En consola del navegador
fetch('http://localhost:3000/api/users')
  .then(r => r.json())
  .then(console.log);
```

## 📦 Dependencias

```json
{
  "react": "^18.2.0",           // Framework UI
  "react-dom": "^18.2.0",       // Renderizado DOM
  "react-router-dom": "^6.20.0" // Routing
}
```

### Dependencias Sugeridas para Seguridad (no incluidas)

```bash
npm install dompurify
npm install yup
npm install helmet
npm install crypto-js
```

## 🚨 Recordatorio de Seguridad

Esta aplicación es **INTENCIONALMENTE VULNERABLE**:

❌ NO usar en producción  
❌ NO exponer a internet  
❌ NO almacenar datos reales  
✅ Solo para laboratorio educativo  
✅ Ejecutar en ambiente aislado  
✅ Aprender de los errores mostrados  

## 🎓 Ejercicios Propuestos

1. **Refactorizar Search.jsx** para eliminar XSS usando DOMPurify
2. **Implementar autenticación** con Context API y proteger rutas
3. **Agregar validación** de formularios con Yup
4. **Implementar CSP** headers y verificar que bloquean XSS
5. **Crear tests** de seguridad con Jest y React Testing Library
6. **Documentar** todas las vulnerabilidades encontradas adicionales

---

**Universidad UPC - Auditoría de Sistemas 2025**  
**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
