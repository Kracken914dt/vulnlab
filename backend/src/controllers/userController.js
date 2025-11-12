const db = require('../config/database');

// ============================================
// BÚSQUEDA CON XSS REFLEJADO
// ============================================
// VULNERABILIDAD: Reflected XSS
// El parámetro de búsqueda se devuelve sin sanitización
// PAYLOAD DE PRUEBA: /search?q=<script>alert('XSS')</script>
// MITIGACIÓN: Sanitizar el output o devolver solo JSON (que el frontend escape)

exports.searchUsers = (req, res) => {
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
};

// ============================================
// PERFIL CON IDOR
// ============================================
// VULNERABILIDAD: IDOR (Insecure Direct Object Reference)
// Cualquiera puede acceder al perfil de cualquier usuario sin autenticación
// PAYLOAD DE PRUEBA: /profile/1 (ver admin), /profile/2 (ver otro usuario)
// MITIGACIÓN: Verificar que el usuario autenticado solo pueda ver su propio perfil

exports.getUserProfile = (req, res) => {
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
};

// ============================================
// API SIN AUTENTICACIÓN
// ============================================
// VULNERABILIDAD: Exposición de datos sensibles sin autenticación
// Cualquiera puede ver la lista completa de usuarios con sus datos
// MITIGACIÓN: Implementar autenticación JWT/session y autorización

exports.getAllUsers = (req, res) => {
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
};
