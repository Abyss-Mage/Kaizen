import { Platform } from 'react-native';

/**
 * 🛡️ KAIZEN ARCHITECT: TROJAN HORSE NETWORK LAYER
 * * This interface decouples the API logic from the actual HTTP transport.
 * Currently uses standard fetch. 
 * Later, this will inject a 'ScrapingBridge' to bypass Cloudflare.
 */

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}

class NetworkClient {
  private baseURL: string = 'https://api.mangadex.org';
  
  private defaultHeaders = {
    'User-Agent': `Kaizen/1.0 (${Platform.OS})`, // Good practice to identify
    'Content-Type': 'application/json',
  };

  /**
   * Helper to serialize params manually if needed, 
   * though URLSearchParams is available in RN.
   */
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
    try {
      const url = this.buildUrl(endpoint, config.params);
      
      // 🚨 INTERCEPTOR POINT: In Phase 2, we check if target is protected here.
      const response = await fetch(url, {
        method: 'GET',
        headers: { ...this.defaultHeaders, ...config.headers },
        signal: AbortSignal.timeout(config.timeout || 10000), // 10s timeout for mobile
      });

      if (!response.ok) {
        console.warn(`[Network] ${response.status} on ${endpoint}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[Network] Failed: ${endpoint}`, error);
      return null;
    }
  }
}

export const client = new NetworkClient();