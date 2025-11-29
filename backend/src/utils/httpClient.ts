import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from './logger';
import { REQUEST_TIMEOUT_MS, SCAN_USER_AGENT } from '../config';

/**
 * HTTP client con retry automatico e exponential backoff
 */
export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'User-Agent': SCAN_USER_AGENT,
    },
  });

  // Configura retry con exponential backoff
  axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => {
      // Exponential backoff: 1s, 2s, 4s
      return retryCount * 1000;
    },
    retryCondition: (error: AxiosError) => {
      // Ritenta su errori di rete o 5xx
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
    onRetry: (retryCount, error) => {
      logger.warn(`Retry attempt ${retryCount} for ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
      });
    },
  });

  // Interceptor per logging
  client.interceptors.request.use(
    (config) => {
      logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      logger.error('HTTP Request Error', { error: error.message });
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        logger.warn(`HTTP Error Response: ${error.response.status} ${error.config?.url}`, {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        logger.error(`HTTP No Response: ${error.config?.url}`, {
          message: error.message,
        });
      } else {
        logger.error('HTTP Request Setup Error', { error: error.message });
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export default createHttpClient();

