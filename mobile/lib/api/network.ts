import { Platform } from 'react-native';

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}

class NetworkClient {
  private baseURL: string = 'https://api.mangadex.org';
  
  private defaultHeaders = {
    'User-Agent': `Kaizen/1.0 (${Platform.OS})`,
    'Content-Type': 'application/json',
  };

  private buildUrl(endpoint: string, params?: Record<string, string | number>) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T | null> {
    const controller = new AbortController();
    // 🛠️ FIX: Manual timeout implementation for Hermes compatibility
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeout || 10000);

    try {
      const url = this.buildUrl(endpoint, config.params);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { ...this.defaultHeaders, ...config.headers },
        signal: controller.signal, 
      });

      clearTimeout(timeoutId); // Clear timer on success

      if (!response.ok) {
        console.warn(`[Network] ${response.status} on ${endpoint}`);
        return null;
      }

      return await response.json();
    } catch (error: any) { // Type as any to safely check .name
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`[Network] Timeout: ${endpoint}`);
      } else {
        console.error(`[Network] Failed: ${endpoint}`, error);
      }
      return null;
    }
  }
}

export const client = new NetworkClient();