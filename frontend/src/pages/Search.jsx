import { useState } from 'react';
import { searchUsers } from '../api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResults(null);
    setError(null);

    try {
      const data = await searchUsers(query);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔍 Búsqueda - XSS Reflejado</h1>

      <div className="vuln-info">
        <h3>🔓 VULNERABILIDAD: Reflected XSS (Cross-Site Scripting)</h3>
        <p>
          <strong>Problema:</strong> El backend devuelve el parámetro de búsqueda sin 
          sanitización y el frontend lo renderiza usando <code>dangerouslySetInnerHTML</code>, 
          permitiendo la ejecución de código JavaScript arbitrario.
        </p>
        <p>
          <strong>Backend vulnerable:</strong>
        </p>
        <div className="code-block">
          <pre>{`res.json({
  query: query, // Sin sanitizar
  results: results
});`}</pre>
        </div>
        <p>
          <strong>Frontend vulnerable:</strong>
        </p>
        <div className="code-block">
          <pre>{`// VULNERABILIDAD: dangerouslySetInnerHTML permite XSS
<div dangerouslySetInnerHTML={{ __html: results.query }} />`}</pre>
        </div>
        <p>
          <strong>Impacto:</strong> Un atacante puede inyectar código JavaScript que se 
          ejecutará en el navegador de la víctima, robando cookies, sesiones, o 
          realizando acciones maliciosas.
        </p>
        <p>
          <strong>Mitigación:</strong> Sanitizar y escapar toda salida HTML usando 
          librerías como DOMPurify, implementar Content-Security-Policy (CSP), 
          y nunca usar <code>dangerouslySetInnerHTML</code> con datos del usuario.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Búsqueda de Usuarios</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="search">Término de búsqueda:</label>
            <input
              type="text"
              id="search"
              className="form-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar usuarios..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>

        {results && (
          <div className="result-box result-success">
            <h3>Resultados de búsqueda:</h3>
            <p>
              Buscaste: 
              {/* VULNERABILIDAD: XSS Reflejado - dangerouslySetInnerHTML renderiza HTML sin escape */}
              <strong>
                <span dangerouslySetInnerHTML={{ __html: results.query }} />
              </strong>
            </p>
            <p>Se encontraron {results.count} resultado(s)</p>

            {results.results.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {results.results.length === 0 && (
              <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
            )}
          </div>
        )}

        {error && (
          <div className="result-box result-error">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">🧪 Payloads de XSS para Probar</h2>
        
        <h3>1. Alert Box Simple con Número</h3>
        <div className="code-block">
          <pre>{`<script>alert(1)</script>`}</pre>
        </div>

        <h3>2. Alert Box con Texto</h3>
        <div className="code-block">
          <pre>{`<script>alert("XSS")</script>`}</pre>
        </div>

        <h3>3. Imagen con Event Handler</h3>
        <div className="code-block">
          <pre>{`<img src=x onerror=alert(1)>`}</pre>
        </div>

        <h3>4. SVG con onload</h3>
        <div className="code-block">
          <pre>{`<svg onload=alert(1)>`}</pre>
        </div>

        <h3>5. XSS con Entidades HTML</h3>
        <div className="code-block">
          <pre>{`<script>alert(&#39;XSS&#39;)</script>`}</pre>
        </div>

        <h3>6. Inyección de Contenido HTML</h3>
        <div className="code-block">
          <pre>{`<h1 style="color:red">¡Sitio Hackeado!</h1>`}</pre>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>⚠️ Nota de Seguridad:</strong> En una aplicación real, NUNCA uses 
        <code>dangerouslySetInnerHTML</code> con datos del usuario. Siempre sanitiza 
        y escapa el contenido. React por defecto escapa el contenido, pero 
        <code>dangerouslySetInnerHTML</code> bypasea esta protección.
      </div>

      <div className="alert alert-info">
        <strong>💡 Ejercicio:</strong> Copia los payloads de arriba y pégalos en el 
        campo de búsqueda. Observa cómo se ejecuta el código JavaScript. Luego, 
        investiga cómo usar DOMPurify o una librería similar para prevenir estos ataques.
      </div>
    </div>
  );
}

export default Search;
