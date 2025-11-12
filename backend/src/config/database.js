const sqlite3 = require('sqlite3').verbose();

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

module.exports = db;
