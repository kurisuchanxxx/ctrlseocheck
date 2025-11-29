import axios from 'axios';
import { PAGESPEED_API_KEY } from '../config';
import { logger } from '../utils/logger';

interface PageSpeedResult {
  loadingExperience?: {
    metrics: {
      [key: string]: {
        percentile: number;
        distributions: Array<{
          min: number;
          max: number;
          proportion: number;
        }>;
      };
    };
    overall_category: string;
  };
  lighthouseResult: {
    categories: {
      performance: { score: number | null };
      accessibility: { score: number | null };
      'best-practices': { score: number | null };
      seo: { score: number | null };
    };
    audits: {
      'first-contentful-paint': { numericValue: number };
      'largest-contentful-paint': { numericValue: number };
      'cumulative-layout-shift': { numericValue: number };
      'total-blocking-time': { numericValue: number };
      'speed-index': { numericValue: number };
      'interactive': { numericValue: number };
      'server-response-time': { numericValue: number };
      'render-blocking-resources': { details?: { items: any[] } };
      'uses-optimized-images': { details?: { items: any[] } };
      'uses-text-compression': { score: number | null };
      'uses-responsive-images': { score: number | null };
      'modern-image-formats': { score: number | null };
    };
  };
}

export interface PageSpeedStrategyMetrics {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms) - deprecated, uso TBT
    cls: number; // Cumulative Layout Shift
    tbt: number; // Total Blocking Time (ms)
  };
  metrics: {
    fcp: number; // First Contentful Paint (ms)
    si: number; // Speed Index (ms)
    tti: number; // Time to Interactive (ms)
    serverResponseTime: number; // (ms)
  };
  optimizations: {
    renderBlockingResources: number;
    unoptimizedImages: number;
    textCompression: boolean;
    responsiveImages: boolean;
    modernImageFormats: boolean;
  };
  loadingExperience?: {
    overallCategory: string;
    metrics: {
      [key: string]: number;
    };
  };
}

export interface PageSpeedMetrics {
  mobile: PageSpeedStrategyMetrics;
  desktop: PageSpeedStrategyMetrics;
}

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Funzione helper per analizzare una singola strategia
async function analyzeStrategy(
  url: string,
  strategy: 'mobile' | 'desktop'
): Promise<PageSpeedStrategyMetrics | null> {
  if (!PAGESPEED_API_KEY) {
    console.warn('⚠️ PageSpeed Insights API key non configurata, saltando analisi avanzata');
    return null;
  }
  
  // Verifica formato API key (dovrebbe iniziare con AIzaSy)
  if (!PAGESPEED_API_KEY.startsWith('AIzaSy')) {
    console.warn('⚠️ API key sembra non valida (dovrebbe iniziare con "AIzaSy"):', PAGESPEED_API_KEY.substring(0, 10) + '...');
    console.warn('⚠️ Verifica di aver copiato correttamente la chiave da Google Cloud Console');
  }
  
  console.log('🔍 Avvio analisi PageSpeed Insights per:', url);
  console.log('🔑 API Key presente:', PAGESPEED_API_KEY.substring(0, 10) + '...');

  try {
    console.log(`⏳ Analisi PageSpeed Insights per ${strategy}...`);
    
    // L'API PageSpeed Insights richiede di specificare esplicitamente le categorie
    const categories = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
    const categoryParams = categories.map(cat => `category=${cat}`).join('&');
    const fullUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=${strategy}&${categoryParams}`;
    
    const result = await axios.get<PageSpeedResult>(fullUrl, {
      timeout: 60000, // 60 secondi
    });
    
    const data = result.data;
    const lighthouse = data.lighthouseResult;
    
    if (!lighthouse || !lighthouse.categories) {
      console.error(`❌ Lighthouse result non valido per ${strategy}`);
      return null;
    }

    // Estrai Core Web Vitals
    const lcp = lighthouse.audits['largest-contentful-paint']?.numericValue || 0;
    const fid = data.loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile || 
                lighthouse.audits['total-blocking-time']?.numericValue || 0;
    const cls = lighthouse.audits['cumulative-layout-shift']?.numericValue || 0;
    const tbt = lighthouse.audits['total-blocking-time']?.numericValue || 0;

    // Estrai altre metriche
    const fcp = lighthouse.audits['first-contentful-paint']?.numericValue || 0;
    const si = lighthouse.audits['speed-index']?.numericValue || 0;
    const tti = lighthouse.audits['interactive']?.numericValue || 0;
    const serverResponseTime = lighthouse.audits['server-response-time']?.numericValue || 0;

    // Estrai ottimizzazioni
    const renderBlockingResources = lighthouse.audits['render-blocking-resources']?.details?.items?.length || 0;
    const unoptimizedImages = lighthouse.audits['uses-optimized-images']?.details?.items?.length || 0;
    const textCompression = lighthouse.audits['uses-text-compression']?.score === 1;
    const responsiveImages = lighthouse.audits['uses-responsive-images']?.score === 1;
    const modernImageFormats = lighthouse.audits['modern-image-formats']?.score === 1;

    // Estrai loading experience se disponibile
    const loadingExperience = data.loadingExperience ? {
      overallCategory: data.loadingExperience.overall_category,
      metrics: Object.entries(data.loadingExperience.metrics || {}).reduce((acc, [key, value]) => {
        acc[key] = value.percentile;
        return acc;
      }, {} as { [key: string]: number }),
    } : undefined;

    // Estrai punteggi
    const perfScore = lighthouse.categories.performance?.score ?? 0;
    const accScore = lighthouse.categories.accessibility?.score ?? 0;
    const bpScore = lighthouse.categories['best-practices']?.score ?? 0;
    const seoScore = lighthouse.categories.seo?.score ?? 0;
    
    // Converti i punteggi (Lighthouse usa scala 0-1, noi vogliamo 0-100)
    const performanceScore = Math.round(perfScore * 100);
    const accessibilityScore = Math.round(accScore * 100);
    const bestPracticesScore = Math.round(bpScore * 100);
    const seoScoreConverted = Math.round(seoScore * 100);
    
    console.log(`✅ ${strategy.toUpperCase()} analisi completata:`, {
      performance: performanceScore,
      accessibility: accessibilityScore,
      'best-practices': bestPracticesScore,
      seo: seoScoreConverted,
    });
    
    return {
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      seoScore: seoScoreConverted,
      coreWebVitals: {
        lcp: Math.round(lcp),
        fid: Math.round(fid),
        cls: Math.round(cls * 1000) / 1000, // CLS è un decimale
        tbt: Math.round(tbt),
      },
      metrics: {
        fcp: Math.round(fcp),
        si: Math.round(si),
        tti: Math.round(tti),
        serverResponseTime: Math.round(serverResponseTime),
      },
      optimizations: {
        renderBlockingResources,
        unoptimizedImages,
        textCompression,
        responsiveImages,
        modernImageFormats,
      },
      loadingExperience,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        logger.warn('PageSpeed Insights timeout - continuing with base analysis');
        return null;
      } else if (error.response?.status === 400) {
        logger.warn('Invalid or unreachable URL for PageSpeed', { response: error.response.data });
      } else if (error.response?.status === 403) {
        logger.warn('PageSpeed API key invalid or quota exhausted', { response: error.response.data });
      } else if (error.response?.status === 429) {
        logger.warn('PageSpeed daily quota exhausted (25k requests/day)');
      } else {
        logger.warn('PageSpeed HTTP error', { status: error.response?.status });
      }
    } else {
      logger.warn('PageSpeed Insights error', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
    // Non bloccare l'analisi se PageSpeed fallisce
    return null;
  }
}

// Funzione principale che analizza sia mobile che desktop
export async function analyzeWithPageSpeed(url: string): Promise<PageSpeedMetrics | null> {
  if (!PAGESPEED_API_KEY) {
    console.warn('⚠️ PageSpeed Insights API key non configurata, saltando analisi avanzata');
    return null;
  }
  
  // Verifica formato API key
  if (!PAGESPEED_API_KEY.startsWith('AIzaSy')) {
    console.warn('⚠️ API key sembra non valida (dovrebbe iniziare con "AIzaSy"):', PAGESPEED_API_KEY.substring(0, 10) + '...');
  }
  
  console.log('🔍 Avvio analisi PageSpeed Insights (mobile + desktop) per:', url);
  console.log('⏳ Questo richiederà ~60-120 secondi (due chiamate API)...');
  
  try {
    // Analizza entrambe le strategie in parallelo per velocità
    const [mobileMetrics, desktopMetrics] = await Promise.allSettled([
      analyzeStrategy(url, 'mobile'),
      analyzeStrategy(url, 'desktop'),
    ]);
    
    const mobile = mobileMetrics.status === 'fulfilled' ? mobileMetrics.value : null;
    const desktop = desktopMetrics.status === 'fulfilled' ? desktopMetrics.value : null;
    
    if (!mobile && !desktop) {
      console.warn('⚠️ Entrambe le analisi (mobile e desktop) sono fallite');
      return null;
    }
    
    // Se una fallisce, usa fallback con valori base
    const fallbackMetrics: PageSpeedStrategyMetrics = {
      performanceScore: 0,
      accessibilityScore: 0,
      bestPracticesScore: 0,
      seoScore: 0,
      coreWebVitals: { lcp: 0, fid: 0, cls: 0, tbt: 0 },
      metrics: { fcp: 0, si: 0, tti: 0, serverResponseTime: 0 },
      optimizations: {
        renderBlockingResources: 0,
        unoptimizedImages: 0,
        textCompression: false,
        responsiveImages: false,
        modernImageFormats: false,
      },
    };
    
    console.log('✅ Analisi PageSpeed Insights completata!');
    logger.info('PageSpeed analysis completed', { mobile: !!mobile, desktop: !!desktop });
    
    return {
      mobile: mobile || fallbackMetrics,
      desktop: desktop || fallbackMetrics,
    };
  } catch (error) {
    logger.error('PageSpeed analysis error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

