import { useEffect, useState } from 'react';
import { getAllUsers } from '../api';

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🏠 Inicio - VulnLab</h1>
      
      <div className="alert alert-warning">
        <strong>⚠️ ADVERTENCIA:</strong> Esta es una aplicación intencionalmente vulnerable 
        diseñada para fines educativos. Contiene múltiples vulnerabilidades de seguridad 
        que nunca deben implementarse en aplicaciones reales.
      </div>

      <div className="card">
        <h2 className="card-title">📚 Sobre este Proyecto</h2>
        <p>
          VulnLab es un laboratorio de seguridad web que demuestra las vulnerabilidades 
          más comunes del OWASP Top 10. Cada página de esta aplicación contiene una 
          vulnerabilidad específica con explicaciones de cómo explotarla y mitigarla.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">🔓 Vulnerabilidades Implementadas</h2>
        <table>
          <thead>
            <tr>
              <th>Página</th>
              <th>Vulnerabilidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Login</strong></td>
              <td>SQL Injection</td>
              <td>Concatenación directa de inputs en consultas SQL</td>
            </tr>
            <tr>
              <td><strong>Búsqueda</strong></td>
              <td>XSS Reflejado</td>
              <td>Parámetro de búsqueda reflejado sin sanitización</td>
            </tr>
            <tr>
              <td><strong>Perfil</strong></td>
              <td>IDOR + XSS</td>
              <td>Acceso sin autorización y renderizado inseguro</td>
            </tr>
            <tr>
              <td><strong>Subir Archivo</strong></td>
              <td>Insecure Upload</td>
              <td>Subida de archivos sin validación de tipo</td>
            </tr>
            <tr>
              <td><strong>Eval</strong></td>
              <td>RCE</td>
              <td>Ejecución de código arbitrario con eval()</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="card-title">👥 Usuarios del Sistema (API sin Autenticación)</h2>
        
        <div className="vuln-info">
          <h3>🔓 VULNERABILIDAD: API Pública sin Autenticación</h3>
          <p>
            <strong>Problema:</strong> El endpoint <code>GET /api/users</code> expone datos 
            sensibles (incluyendo contraseñas) sin requerir autenticación.
          </p>
          <p>
            <strong>Impacto:</strong> Cualquier persona puede obtener credenciales de todos 
            los usuarios del sistema.
          </p>
          <p>
            <strong>Mitigación:</strong> Implementar autenticación JWT o sesiones, no exponer 
            contraseñas, usar hashing (bcrypt), implementar control de acceso basado en roles.
          </p>
        </div>

        {loading && <div className="loading">Cargando usuarios...</div>}
        
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Contraseña</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td><code>{user.password}</code></td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">🎯 Objetivos de Aprendizaje</h2>
        <ul style={{ lineHeight: '2', paddingLeft: '2rem' }}>
          <li>Identificar vulnerabilidades comunes en aplicaciones web</li>
          <li>Comprender el impacto de cada vulnerabilidad</li>
          <li>Aprender técnicas de explotación en un entorno seguro</li>
          <li>Conocer las mejores prácticas de mitigación</li>
          <li>Desarrollar habilidades de auditoría de seguridad</li>
        </ul>
      </div>

      <div className="alert alert-info">
        <strong>💡 Consejo:</strong> Explora cada página del menú superior para interactuar 
        con las diferentes vulnerabilidades. Lee atentamente las explicaciones y payloads 
        de ejemplo proporcionados en cada sección.
      </div>
    </div>
  );
}

export default Home;
