// ============================================
// CLIENTE API PARA COMUNICACIÓN CON BACKEND
// ============================================

const API_BASE_URL = 'http://localhost:8000';

/**
 * Login de usuario
 * VULNERABILIDAD: El backend es vulnerable a SQL Injection
 */
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Incluir cookies
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en el login');
  }
  
  return response.json();
};

/**
 * Búsqueda de usuarios
 * VULNERABILIDAD: El backend devuelve el query sin sanitizar (XSS Reflejado)
 */
export const searchUsers = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Error en la búsqueda');
  }
  
  return response.json();
};

/**
 * Obtener perfil de usuario
 * VULNERABILIDAD: IDOR - Cualquiera puede ver cualquier perfil
 */
export const getProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener perfil');
  }
  
  return response.json();
};

/**
 * Obtener archivo
 * VULNERABILIDAD: Directory Traversal en el backend
 */
export const getFile = async (filename) => {
  const response = await fetch(`${API_BASE_URL}/files?f=${encodeURIComponent(filename)}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener archivo');
  }
  
  return response.text();
};

/**
 * Subir archivo
 * VULNERABILIDAD: Insecure File Upload - Sin validación de tipo
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al subir archivo');
  }
  
  return response.json();
};

/**
 * Ejecutar código
 * VULNERABILIDAD: RCE - El backend ejecuta eval() con el código enviado
 */
export const executeCode = async (code) => {
  const response = await fetch(`${API_BASE_URL}/eval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al ejecutar código');
  }
  
  return response.json();
};

/**
 * Obtener lista de usuarios
 * VULNERABILIDAD: API sin autenticación - Expone datos sensibles
 */
export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener usuarios');
  }
  
  return response.json();
};
