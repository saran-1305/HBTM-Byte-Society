import { api, setToken, clearToken, getToken } from './api';

export interface AuthUser {
  id: string;
  email: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const isAuthenticated = (): boolean => !!getToken();

export async function registerAccount(email: string, password: string): Promise<AuthUser> {
  return api.post<AuthUser>('/api/auth/register', { email, password }, { auth: false });
}

// Backend's /login is OAuth2PasswordRequestForm: form-encoded, "username" not "email".
export async function login(email: string, password: string): Promise<AuthUser> {
  const { access_token } = await api.post<TokenResponse>(
    '/api/auth/login',
    { username: email, password },
    { auth: false, form: true }
  );
  setToken(access_token);
  try {
    return await api.get<AuthUser>('/api/auth/me');
  } catch (err) {
    clearToken();
    throw err;
  }
}

// Registration doesn't return a session — log in right after so the caller
// only ever deals with one "now you're signed in" step.
export async function registerAndLogin(email: string, password: string): Promise<AuthUser> {
  await registerAccount(email, password);
  return login(email, password);
}

export function logout(): void {
  clearToken();
}
