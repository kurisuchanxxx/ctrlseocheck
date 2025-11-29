import 'dotenv/config';
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { AnalysisRequestBody } from "./types";
import {
  getAnalysis,
  listAnalyses,
  performAnalysis,
} from "./services/analysisService";
import { transformToFrontendFormat } from "./services/resultTransformer";
import { logger } from "./utils/logger";
import { validateAndCheckUrl, sanitizeUrl } from "./utils/urlValidator";

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(limiter);

app.get("/health", (_req, res) => {
  logger.debug('Health check');
  res.json({ status: "ok" });
});

app.get("/api/history", (_req, res) => {
  const analyses = listAnalyses();
  res.json(analyses.map(transformToFrontendFormat));
});

app.get("/api/analysis/:id", (req, res) => {
  const analysis = getAnalysis(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: "Analisi non trovata" });
  }
  res.json(transformToFrontendFormat(analysis));
});

app.post("/api/analyze", async (req, res) => {
  // Aumenta timeout per questa richiesta (PageSpeed può richiedere tempo)
  req.setTimeout(90000); // 90 secondi
  
  const body = req.body as AnalysisRequestBody & { 
    businessSector?: string; 
    targetLocation?: string;
    competitors?: string[] 
  };
  
  logger.info('Analysis request received', { url: body.url });
  
  // Validazione parametri
  if (!body?.url) {
    logger.warn('Analysis request missing URL');
    return res.status(400).json({
      error: "URL è obbligatorio",
    });
  }
  
  if (!body?.businessType && !body?.businessSector) {
    logger.warn('Analysis request missing businessType');
    return res.status(400).json({
      error: "businessType o businessSector è obbligatorio",
    });
  }
  
  if (!body?.location && !body?.targetLocation) {
    logger.warn('Analysis request missing location');
    return res.status(400).json({
      error: "location o targetLocation è obbligatorio",
    });
  }
  
  try {
    // Sanitizza e valida URL
    const sanitizedUrl = sanitizeUrl(body.url);
    const urlValidation = await validateAndCheckUrl(sanitizedUrl);
    
    if (!urlValidation.valid) {
      logger.warn('Invalid URL format', { url: sanitizedUrl, error: urlValidation.error });
      return res.status(400).json({
        error: `URL non valido: ${urlValidation.error}`,
      });
    }
    
    if (!urlValidation.reachable) {
      logger.warn('URL not reachable', { url: sanitizedUrl, error: urlValidation.error });
      return res.status(400).json({
        error: `URL non raggiungibile: ${urlValidation.error || 'Impossibile connettersi al sito'}`,
      });
    }
    
    const requestBody: AnalysisRequestBody = {
      url: sanitizedUrl,
      businessType: body.businessType || body.businessSector || 'altro',
      location: body.location || body.targetLocation || '',
      competitors: body.competitors?.map((url: string) => sanitizeUrl(url)).map((url) => ({ url })) || undefined,
      forceRefresh: body.forceRefresh,
    };
    
    logger.info('Starting analysis', { url: sanitizedUrl, location: requestBody.location });
    const result = await performAnalysis(requestBody);
    logger.info('Analysis completed', { url: sanitizedUrl, score: result.scoring.totalScore });
    res.json(transformToFrontendFormat(result));
  } catch (error) {
    logger.error('Analysis error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: body.url,
    });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Errore durante l'analisi",
    });
  }
});

app.listen(PORT, () => {
  logger.info(`SEO audit API running on http://localhost:${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  });
});

