const API = import.meta.env.VITE_API || 'http://localhost:8080';

async function j(url, method='GET', body){
  const res = await fetch(`${API}${url}`, {
    method, credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

export const signup = (data) => j('/api/signup','POST',data);
export const login = (data) => j('/api/login','POST',data);
export const logout = () => j('/api/logout','POST');
export const me = () => j('/api/me');
export const getGuiUrl = () => j('/api/protected/gui-url');
export const getApiUrl = () => j('/api/protected/api-url');
export const requestPasswordReset = (email) => j('/api/request-password-reset','POST',{ email });
export const resetPassword = (token,password) => j('/api/reset-password','POST',{ token, password });
export const adminUsers = () => j('/api/admin/users');