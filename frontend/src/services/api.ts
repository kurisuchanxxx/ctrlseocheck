import axios from 'axios';
import type { AnalysisRequest, AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 secondi (per dare tempo a PageSpeed Insights)
});

// Interceptor per gestire errori di connessione
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Errore di connessione al backend. Assicurati che il backend sia in esecuzione su', API_BASE_URL);
      throw new Error('Impossibile connettersi al server. Verifica che il backend sia in esecuzione su http://localhost:3001');
    }
    throw error;
  }
);

export const analysisApi = {
  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const response = await api.post<AnalysisResult>('/api/analyze', request);
    return response.data;
  },

  async getHistory(): Promise<AnalysisResult[]> {
    const response = await api.get<AnalysisResult[]>('/api/history');
    return response.data;
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    const response = await api.get<AnalysisResult>(`/api/analysis/${id}`);
    return response.data;
  },

  async generatePDF(analysisId: string): Promise<Blob> {
    const response = await api.get(`/api/pdf/${analysisId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;

