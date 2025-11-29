import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { MAX_COMPETITORS } from "../config";
import { cacheService } from "./cacheService";
import { runHtmlAnalysis } from "./htmlAnalyzer";
import { simulateOffPageSignals } from "./offPageService";
import { analyzeCompetitors } from "./competitorService";
import { buildRecommendations } from "./recommendationService";
import { buildScoring } from "./scoreService";
import { buildSummary } from "./summaryService";
import { storageService } from "./storageService";
import { analyzeWithPageSpeed } from "./pagespeedService";
import { analyzeAeo } from "./aeoAnalyzer";
import {
  AnalysisRequestBody,
  AnalysisResult,
  OffPageSeoMetrics,
} from "../types";

const normalizeUrl = (url: string) => {
  const hasProtocol = url.startsWith("http://") || url.startsWith("https://");
  const normalized = hasProtocol ? url : `https://${url}`;
  return normalized.replace(/\/$/, "");
};

const validateUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

export const performAnalysis = async (
  payload: AnalysisRequestBody
): Promise<AnalysisResult> => {
  const normalizedUrl = normalizeUrl(payload.url);
  if (!validateUrl(normalizedUrl)) {
    throw new Error("URL non valido");
  }

  const cacheKey = `${normalizedUrl}_${payload.location}`.toLowerCase();
  const cached = cacheService.get(cacheKey);

  if (cached && !payload.forceRefresh) {
    return cached;
  }

  // Analisi PageSpeed Insights con timeout (opzionale, non blocca se fallisce)
  // Ora analizziamo sia mobile che desktop, quindi aumentiamo il timeout a 90 secondi
  const pagespeedPromise = analyzeWithPageSpeed(normalizedUrl);
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.warn('⏱️ PageSpeed Insights timeout dopo 90 secondi (mobile + desktop), continuo con analisi base');
      resolve(null);
    }, 90000); // 90 secondi max per entrambe le chiamate
  });
  
  const pagespeedMetrics = await Promise.race([pagespeedPromise, timeoutPromise]).catch((err) => {
    console.warn('⚠️ PageSpeed Insights non disponibile, uso analisi base:', err.message);
    return null;
  });

  const { technical, onPage, local } = await runHtmlAnalysis(
    normalizedUrl,
    payload.location,
    pagespeedMetrics
  );

  // Analisi AEO/RAO (Answer Engine Optimization)
  // Dobbiamo recuperare l'HTML per analizzare AEO
  const aeo = await (async () => {
    try {
      const { createHttpClient } = await import("../utils/httpClient");
      const { sanitizeHtml } = await import("../utils/sanitizer");
      const httpClient = createHttpClient();
      const response = await httpClient.get(normalizedUrl, {
        responseType: "text",
        timeout: 15000,
      });
      const sanitizedHtml = sanitizeHtml(response.data);
      return analyzeAeo(sanitizedHtml, normalizedUrl);
    } catch (error: any) {
      // Se fallisce, restituisci valori di default
      const { logger } = await import("../utils/logger");
      logger.warn('AEO analysis failed, using defaults', {
        url: normalizedUrl,
        error: error.message,
      });
      return analyzeAeo("", normalizedUrl);
    }
  })();

  // Off-Page SEO: ora con verifiche reali
  const offPage: OffPageSeoMetrics = await simulateOffPageSignals(
    normalizedUrl,
    technical.hasSsl,
    technical.hasSitemap,
    technical.hasRobots,
    local.napDetails.name
  );
  offPage.hasGoogleBusinessProfile ||= local.hasLocalSchema;

  const competitors = analyzeCompetitors(
    (payload.competitors || []).map((c) => normalizeUrl(c.url)).slice(0, MAX_COMPETITORS)
  );

  const recommendations = buildRecommendations({
    technical,
    onPage,
    local,
    offPage,
    aeo,
  });

  const scoring = buildScoring({ technical, onPage, local, offPage, aeo });

  const baseResult = {
    id: uuid(),
    url: normalizedUrl,
    businessType: payload.businessType,
    location: payload.location,
    timestamp: dayjs().toISOString(),
    technical,
    onPage,
    local,
    offPage,
    aeo,
    scoring,
    recommendations,
    competitors,
  } as Omit<AnalysisResult, "summary">;

  const result: AnalysisResult = {
    ...baseResult,
    summary: buildSummary(baseResult),
  };

  cacheService.set(cacheKey, result);
  storageService.saveAnalysis(result);

  return result;
};

export const listAnalyses = () => storageService.getAnalyses();
export const getAnalysis = (id: string) => storageService.getAnalysis(id);

