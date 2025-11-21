export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function logout() {
  localStorage.removeItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

// Check if user is authenticated for reports
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if user has admin role or specific permissions
    return payload.role === 'admin' || payload.role === 'reporter';
  } catch {
    return false;
  }
}