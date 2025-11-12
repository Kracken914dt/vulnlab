const db = require('../config/database');

// ============================================
// LOGIN CON SQL INJECTION
// ============================================
// VULNERABILIDAD: SQL Injection por concatenación directa
// El input del usuario se concatena directamente en la query sin sanitización
// PAYLOAD DE PRUEBA: username: admin' OR '1'='1 , password: cualquier cosa
// MITIGACIÓN: Usar prepared statements con placeholders

exports.login = (req, res) => {
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
};
