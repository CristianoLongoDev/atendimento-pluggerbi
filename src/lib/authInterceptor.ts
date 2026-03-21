import { authenticatedFetch } from './apiClient';
import { logSecurityEvent } from './security';

export class AuthInterceptor {
  private static instance: AuthInterceptor;

  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    try {
      return await authenticatedFetch(url, options);
    } catch (error) {
      logSecurityEvent('AUTHENTICATED_REQUEST_ERROR', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async callExternalAPI(url: string, data?: any, method?: string): Promise<any> {
    const requestMethod = method || (data ? 'POST' : 'GET');

    const response = await this.makeAuthenticatedRequest(url, {
      method: requestMethod,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logSecurityEvent('EXTERNAL_API_ERROR', {
        url,
        status: response.status,
        error: errorText,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const makeAuthenticatedRequest = (url: string, options?: RequestInit) => {
  return AuthInterceptor.getInstance().makeAuthenticatedRequest(url, options);
};

export const callExternalAPI = (url: string, data?: any, method?: string) => {
  return AuthInterceptor.getInstance().callExternalAPI(url, data, method);
};
