import { useState } from 'react';
import { uploadFile } from '../api';

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Debes seleccionar un archivo');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const data = await uploadFile(file);
      setResult(data);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">� Subir Archivo - Insecure File Upload</h1>

      <div className="vuln-info">
        <h3>🔓 VULNERABILIDAD: Insecure File Upload</h3>
        <p>
          <strong>Problema:</strong> El backend acepta cualquier tipo de archivo sin 
          validación de extensión, MIME type, ni tamaño. Los archivos se guardan con 
          su nombre original y son accesibles públicamente.
        </p>
        <p>
          <strong>Impacto:</strong> Un atacante puede subir archivos ejecutables maliciosos, 
          web shells, archivos HTML con XSS, o causar DoS con archivos grandes.
        </p>
        <p>
          <strong>Mitigación:</strong> Validar extensión y MIME type, renombrar archivos
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
        
        <h3>1. Alert Box Simple</h3>
        <div className="code-block">
          <pre>{`<script>alert('XSS Vulnerable!')</script>`}</pre>
        </div>

        <h3>2. Robo de Cookies</h3>
        <div className="code-block">
          <pre>{`<script>alert(document.cookie)</script>`}</pre>
        </div>

        <h3>3. Redirección Maliciosa</h3>
        <div className="code-block">
          <pre>{`<script>window.location='http://malicious-site.com'</script>`}</pre>
        </div>

        <h3>4. Inyección de HTML</h3>
        <div className="code-block">
          <pre>{`<img src=x onerror=alert('XSS')>`}</pre>
        </div>

        <h3>5. Event Handler XSS</h3>
        <div className="code-block">
          <pre>{`<svg onload=alert('XSS')>`}</pre>
        </div>

        <h3>6. XSS con Decodificación HTML</h3>
        <div className="code-block">
          <pre>{`<img src="x" onerror="eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))">`}</pre>
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

export default Upload;
