const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║           VulnLab Backend Server                       ║
║                                                        ║
║  🚀 Servidor corriendo en http://localhost:${PORT}    ║
║  ⚠️  ENTORNO VULNERABLE - Solo para educación         ║
║                                                        ║
║  Endpoints disponibles:                               ║
║  • POST /login          (SQL Injection)               ║
║  • GET  /search         (XSS Reflejado)               ║
║  • GET  /profile/:id    (IDOR)                        ║
║  • GET  /files?f=...    (Path Traversal)              ║
║  • POST /upload         (Insecure Upload)             ║
║  • POST /eval           (RCE)                         ║
║  • GET  /api/users      (Sin Auth)                    ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\nCerrando servidor y base de datos...');
  db.close();
  process.exit(0);
});
