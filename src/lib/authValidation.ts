import { getAccessToken, isTokenExpired } from './tokenStore';
import { ensureValidToken } from './apiClient';
import { logSecurityEvent } from './security';

interface TokenInfo {
  isValid: boolean;
  isExpired: boolean;
  hasAccountId: boolean;
  accountId?: string;
  expiresAt?: number;
  currentTime: number;
  payload?: any;
}

function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
}

export async function validateCurrentToken(): Promise<TokenInfo> {
  const currentTime = Math.floor(Date.now() / 1000);
  const token = getAccessToken();

  if (!token) {
    return { isValid: false, isExpired: true, hasAccountId: false, currentTime };
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return { isValid: false, isExpired: true, hasAccountId: false, currentTime };
  }

  const expired = isTokenExpired();
  const hasAccountId = !!payload.account_id;

  return {
    isValid: !expired && hasAccountId,
    isExpired: expired,
    hasAccountId,
    accountId: payload.account_id,
    expiresAt: payload.exp,
    currentTime,
    payload,
  };
}

export function validateAuthHeaders(token?: string): boolean {
  if (!token) return false;
  return token.length > 0;
}

export async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = await ensureValidToken();
  return token !== null;
}

export async function runAuthDiagnostics(): Promise<void> {
  const tokenInfo = await validateCurrentToken();

  if (tokenInfo.isExpired && !tokenInfo.isValid) {
    const refreshed = await refreshTokenIfNeeded();
    if (refreshed) {
      await validateCurrentToken();
    }
  }

  if (!tokenInfo.isValid) {
    logSecurityEvent('TOKEN_VALIDATION_FAILED', {
      isExpired: tokenInfo.isExpired,
      hasAccountId: tokenInfo.hasAccountId,
    });
  }
}
