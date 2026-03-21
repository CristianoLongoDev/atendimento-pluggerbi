const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
  USER: 'auth_user',
} as const;

export interface AuthUser {
  id: string;
  email: string;
  account_id: string;
  full_name: string;
  role: string;
}

export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, String(Date.now() + expiresIn * 1000));
}

export function saveUser(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(TOKEN_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
  if (!expiresAt) return true;
  return Date.now() >= Number(expiresAt) - 30_000; // 30s margin
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.USER);
}
