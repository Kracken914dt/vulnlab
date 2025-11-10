import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile } from '../api';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customId, setCustomId] = useState(id || '1');

  useEffect(() => {
    loadProfile(id);
  }, [id]);

  const loadProfile = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/profile/${customId}`);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">👤 Perfil de Usuario - IDOR + XSS</h1>

      <div className="vuln-info">
        <h3>🔓 VULNERABILIDAD 1: IDOR (Insecure Direct Object Reference)</h3>
        <p>
          <strong>Problema:</strong> El endpoint <code>GET /profile/:id</code> no valida 
          que el usuario autenticado tenga permiso para ver ese perfil. Cualquiera puede 
          acceder a cualquier perfil simplemente cambiando el ID en la URL.
        </p>
        <p>
          <strong>Código vulnerable (backend):</strong>
        </p>
        <div className="code-block">
          <pre>{`app.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  // Sin verificar autenticación ni autorización
  db.get(\`SELECT * FROM users WHERE id = ?\`, [userId], callback);
});`}</pre>
        </div>
        <p>
          <strong>Mitigación:</strong> Verificar que el usuario autenticado solo pueda 
          acceder a su propio perfil, o implementar control de acceso basado en roles 
          para permitir a administradores ver otros perfiles.
        </p>

        <h3>🔓 VULNERABILIDAD 2: XSS Almacenado</h3>
        <p>
          <strong>Problema:</strong> El nombre de usuario se renderiza usando 
          <code>dangerouslySetInnerHTML</code>, permitiendo XSS si el usuario tiene 
          código malicioso en su nombre.
        </p>
        <p>
          <strong>Mitigación:</strong> Sanitizar datos antes de almacenarlos en la BD, 
          escapar HTML al renderizar, usar CSP headers, y evitar <code>dangerouslySetInnerHTML</code>.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Cambiar ID de Perfil</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">ID de Usuario:</label>
            <input
              type="number"
              id="userId"
              className="form-control"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Ingresa un ID (1, 2, 3...)"
              min="1"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Ver Perfil
          </button>
        </form>
      </div>

      {loading && <div className="loading">Cargando perfil...</div>}

      {error && (
        <div className="result-box result-error">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && profile && (
        <div className="card">
          <h2 className="card-title">Información del Perfil</h2>
          
          <div className="result-box result-success">
            <h3>Datos del Usuario ID: {profile.id}</h3>
            
            <p>
              <strong>Nombre de Usuario:</strong>{' '}
              {/* VULNERABILIDAD: XSS - dangerouslySetInnerHTML puede ejecutar scripts */}
              <span dangerouslySetInnerHTML={{ __html: profile.username }} />
            </p>
            
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Rol:</strong> {profile.role}</p>
            <p><strong>Contraseña (texto plano):</strong> <code>{profile.password}</code></p>

            <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
              <strong>⚠️ Exposición de Datos Sensibles:</strong> La API devuelve 
              la contraseña en texto plano. En una aplicación real, las contraseñas 
              deben estar hasheadas (bcrypt, argon2) y NUNCA deben exponerse.
            </div>

            <div className="code-block">
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">🧪 Pruebas de IDOR</h2>
        
        <h3>Usuarios Disponibles para Probar:</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>
            <strong>ID 1:</strong> admin (rol: admin)
            <button 
              onClick={() => navigate('/profile/1')} 
              className="btn btn-primary" 
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
            >
              Ver Perfil
            </button>
          </li>
          <li>
            <strong>ID 2:</strong> usuario (rol: user)
            <button 
              onClick={() => navigate('/profile/2')} 
              className="btn btn-primary" 
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
            >
              Ver Perfil
            </button>
          </li>
          <li>
            <strong>ID 3:</strong> test con XSS (rol: user) - ¡Cuidado, contiene script!
            <button 
              onClick={() => navigate('/profile/3')} 
              className="btn btn-danger" 
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
            >
              Ver Perfil (XSS)
            </button>
          </li>
        </ul>

        <div className="alert alert-warning">
          <strong>⚠️ Nota:</strong> Al hacer clic en "Ver Perfil (XSS)" del usuario ID 3, 
          se ejecutará un script almacenado en el nombre de usuario. Este es un ejemplo 
          de XSS Almacenado (Stored XSS).
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">🛡️ Cómo Protegerse</h2>
        
        <h3>Contra IDOR:</h3>
        <div className="code-block">
          <pre>{`// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};

// Verificar autorización
app.get('/profile/:id', requireAuth, (req, res) => {
  const userId = req.params.id;
  
  // Solo permitir ver el propio perfil
  if (req.session.userId !== parseInt(userId)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  // O verificar rol de admin
  if (req.session.role !== 'admin' && req.session.userId !== parseInt(userId)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  // Continuar con la consulta...
});`}</pre>
        </div>

        <h3>Contra XSS:</h3>
        <div className="code-block">
          <pre>{`// En React, usar renderizado normal (NO dangerouslySetInnerHTML)
<p><strong>Usuario:</strong> {profile.username}</p>

// Si necesitas HTML, sanitizar con DOMPurify
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(profile.username);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />

// Backend: Validar y sanitizar antes de guardar
const sanitizeHtml = require('sanitize-html');
const clean = sanitizeHtml(username, {
  allowedTags: [],
  allowedAttributes: {}
});`}</pre>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>💡 Ejercicio:</strong> 
        <ol style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
          <li>Sin autenticarte, accede a diferentes perfiles (IDs 1, 2, 3)</li>
          <li>Observa cómo puedes ver datos sensibles de cualquier usuario</li>
          <li>Prueba el usuario ID 3 que tiene código JavaScript en su nombre</li>
          <li>Piensa en cómo implementarías las mitigaciones propuestas</li>
        </ol>
      </div>
    </div>
  );
}

export default Profile;
