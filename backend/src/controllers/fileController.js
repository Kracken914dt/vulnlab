const fs = require('fs');
const path = require('path');

// ============================================
// DIRECTORY TRAVERSAL
// ============================================
// VULNERABILIDAD: Path Traversal / Directory Traversal
// Permite leer archivos arbitrarios del sistema usando ../
// PAYLOAD DE PRUEBA: /files?f=../../../etc/passwd (Linux) o /files?f=../server.js
// MITIGACIÓN: Validar y sanitizar el path, usar whitelist de archivos permitidos

exports.getFile = (req, res) => {
  const filename = req.query.f || '';
  
  // PELIGRO: Construcción directa del path sin validación
  const filePath = path.join(__dirname, '../../public', 'uploads', filename);
  
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
};

// ============================================
// INSECURE FILE UPLOAD
// ============================================
// VULNERABILIDAD: Subida de archivos sin validación
// Permite subir cualquier tipo de archivo (PHP, ejecutables, etc.)
// PAYLOAD DE PRUEBA: Subir un archivo shell.php o malware.exe

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }
  
  console.log('[Insecure Upload] Archivo subido:', req.file.filename);
  
  const PORT = process.env.PORT || 3000;
  
  res.json({
    success: true,
    message: 'Archivo subido exitosamente',
    filename: req.file.filename,
    url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
};
