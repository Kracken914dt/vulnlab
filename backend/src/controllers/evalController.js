// ============================================
// REMOTE CODE EXECUTION
// ============================================
// VULNERABILIDAD: RCE mediante eval()
// Ejecuta código JavaScript arbitrario del usuario
// PAYLOAD DE PRUEBA: code: require('child_process').execSync('whoami').toString()
// MITIGACIÓN: NUNCA usar eval() con input del usuario, usar sandboxing o vm2

exports.executeCode = (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Falta el parámetro "code"' });
  }
  
  try {
    console.log('[RCE] Ejecutando código:', code);
    
    // ¡EXTREMADAMENTE PELIGROSO!
    const result = eval(code);
    
    res.json({
      success: true,
      input: code,
      output: result,
      type: typeof result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack // Exponer el stack trace
    });
  }
};
