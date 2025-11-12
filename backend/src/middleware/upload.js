const multer = require('multer');
const path = require('path');

// ============================================
// VULNERABILIDAD: Insecure File Upload
// ============================================
// MITIGACIÓN: Validar extensión, MIME type, tamaño, renombrar archivos, escanear malware

const uploadsDir = path.join(__dirname, '../../public/uploads');

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

module.exports = upload;
