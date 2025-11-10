# VulnLab - Laboratorio de Vulnerabilidades Web

Este repositorio contiene una aplicación web **intencionalmente vulnerable** diseñada para prácticas de auditoría de sistemas y seguridad web. **NO USAR EN PRODUCCIÓN**.

## 🎯 Objetivo

Demostrar vulnerabilidades comunes en aplicaciones web (OWASP Top 10) y aprender cómo mitigarlas mediante un entorno de laboratorio controlado.

## 📦 Estructura del Proyecto

```
vulnlab/
├─ backend/          # API REST en Node.js + Express + SQLite
│  ├─ server.js      # Servidor con endpoints vulnerables
│  ├─ package.json
│  └─ README-backend.md
├─ frontend/         # SPA en React + Vite
│  ├─ src/
│  │  ├─ pages/      # Páginas para explotar vulnerabilidades
│  │  └─ api.js      # Cliente HTTP
│  ├─ package.json
│  └─ README-frontend.md
└─ README.md
```

## 🚀 Inicio Rápido

### Backend (Puerto 3000)

```bash
cd backend
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend (Puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔓 Vulnerabilidades Implementadas

| Vulnerabilidad | Endpoint/Página | Descripción |
|----------------|----------------|-------------|
| **SQL Injection** | `POST /login` | Concatenación directa de inputs en consultas SQL |
| **XSS Reflejado** | `GET /search?q=...` | Parámetro reflejado sin sanitización |
| **XSS Almacenado** | `GET /profile/:id` | Renderizado de datos sin escape con `dangerouslySetInnerHTML` |
| **IDOR** | `GET /profile/:id` | Acceso a perfiles sin validación de autorización |
| **Directory Traversal** | `GET /files?f=...` | Path transversal para leer archivos del sistema |
| **Insecure File Upload** | `POST /upload` | Subida de archivos sin validación de tipo |
| **Remote Code Execution** | `POST /eval` | Ejecución de código arbitrario con `eval()` |
| **API sin Autenticación** | `GET /api/users` | Exposición de datos sensibles sin autenticación |
| **CORS Permisivo** | Todas las rutas | CORS configurado con `*` permitiendo cualquier origen |

## 📚 Uso Educativo

Cada archivo incluye:
- ✅ **Comentarios `// VULNERABILIDAD:`** explicando el problema
- ✅ **Notas de mitigación** con mejores prácticas
- ✅ **Ejemplos de payloads** para probar las vulnerabilidades

## ⚠️ Advertencia

Este proyecto es **SOLO PARA FINES EDUCATIVOS** en entornos controlados. Nunca desplegar en producción ni exponer a internet. Las vulnerabilidades son intencionales y peligrosas.

## 📖 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)
- Consulta los READMEs individuales en `backend/` y `frontend/` para más detalles

## 🛡️ Mitigaciones Generales

- Usar **prepared statements** o ORMs para prevenir SQLi
- **Sanitizar y escapar** toda entrada del usuario
- Implementar **autenticación y autorización** robustas
- Validar **tipo, tamaño y contenido** de archivos subidos
- **NUNCA** usar `eval()` con entrada del usuario
- Configurar **CORS restrictivo** solo a orígenes confiables
- Usar **CSP (Content Security Policy)** headers
- Implementar **rate limiting** y logging de seguridad

---

**Autor:** Proyecto educativo - Auditoría de Sistemas  
**Fecha:** 2025  
**Licencia:** Uso educativo únicamente
