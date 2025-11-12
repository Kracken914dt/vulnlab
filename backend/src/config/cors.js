// ============================================
// VULNERABILIDAD: CORS Permisivo
// ============================================
// Permitir CUALQUIER origen puede exponer la API a ataques CSRF y acceso no autorizado
// MITIGACIÓN: Usar una whitelist de orígenes permitidos
// Para este laboratorio, permitimos el origen del frontend para que funcione con credentials

const corsOptions = {
  origin: 'http://localhost:5173', // Origen específico para permitir credentials
  credentials: true
};

// NOTA: En un entorno real vulnerable, se usaría origin: '*', pero eso no funciona 
// con credentials: true. Para fines educativos, usamos el origen específico.

module.exports = corsOptions;
