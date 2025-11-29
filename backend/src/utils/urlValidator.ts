import axios from 'axios';
import { logger } from './logger';

/**
 * Valida e verifica che un URL sia raggiungibile
 */
export async function validateAndCheckUrl(url: string): Promise<{ valid: boolean; reachable: boolean; error?: string }> {
  // Validazione formato URL
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reachable: false, error: 'Protocol must be http or https' };
    }
    if (!parsed.hostname) {
      return { valid: false, reachable: false, error: 'Invalid hostname' };
    }
  } catch {
    return { valid: false, reachable: false, error: 'Invalid URL format' };
  }

  // Verifica raggiungibilità con HEAD request (più veloce)
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accetta 4xx ma non 5xx
    });

    // 2xx e 3xx sono considerati raggiungibili
    const reachable = response.status >= 200 && response.status < 400;
    
    if (!reachable) {
      logger.warn(`URL not reachable: ${url}`, { status: response.status });
    }

    return { valid: true, reachable };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return { valid: true, reachable: false, error: 'Domain not found or unreachable' };
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return { valid: true, reachable: false, error: 'Connection timeout' };
      }
      if (error.response) {
        // 4xx sono considerati raggiungibili (il server risponde)
        return { valid: true, reachable: error.response.status < 500 };
      }
    }
    return { valid: true, reachable: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Sanitizza URL per prevenire attacchi
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Rimuovi fragment, query pericolose, etc.
    parsed.hash = '';
    // Mantieni solo query params sicuri
    const safeParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      // Filtra parametri potenzialmente pericolosi
      if (!['javascript:', 'data:', 'vbscript:'].some(danger => value.toLowerCase().includes(danger))) {
        safeParams.append(key, value);
      }
    }
    parsed.search = safeParams.toString();
    return parsed.toString();
  } catch {
    return url; // Se non è un URL valido, ritorna originale (sarà validato dopo)
  }
}

