import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpired,
} from './tokenStore';

export const API_BASE = import.meta.env.DEV ? '' : 'https://pluggyapi.pluggerbi.com';

export const WS_BASE = import.meta.env.DEV
  ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
  : 'wss://pluggyapi.pluggerbi.com';

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.status === 'success') {
        saveTokens(data.access_token, data.refresh_token, data.expires_in);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function ensureValidToken(): Promise<string | null> {
  if (isTokenExpired()) {
    const ok = await refreshTokens();
    if (!ok) {
      clearTokens();
      return null;
    }
  }
  return getAccessToken();
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = await ensureValidToken();
  if (!token) {
    window.location.href = '/auth';
    throw new Error('Sessão expirada');
  }

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, { ...options, headers: mergedHeaders });

  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      token = getAccessToken();
      mergedHeaders['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, { ...options, headers: mergedHeaders });
    } else {
      clearTokens();
      window.location.href = '/auth';
      throw new Error('Sessão expirada');
    }
  }

  return response;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await ensureValidToken();
  if (!token) {
    throw new Error('Token de acesso não encontrado');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
