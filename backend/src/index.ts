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

app.get("/health", (_req, res) => res.json({ status: "ok" }));

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
  
  console.log('📥 Richiesta analisi ricevuta:', body.url);
  
  // Validazione parametri
  if (!body?.url) {
    console.log('Errore: URL mancante');
    return res.status(400).json({
      error: "URL è obbligatorio",
    });
  }
  
  if (!body?.businessType && !body?.businessSector) {
    console.log('Errore: businessType/businessSector mancante');
    return res.status(400).json({
      error: "businessType o businessSector è obbligatorio",
    });
  }
  
  if (!body?.location && !body?.targetLocation) {
    console.log('Errore: location/targetLocation mancante');
    return res.status(400).json({
      error: "location o targetLocation è obbligatorio",
    });
  }
  
  try {
    const requestBody: AnalysisRequestBody = {
      url: body.url,
      businessType: body.businessType || body.businessSector || 'altro',
      location: body.location || body.targetLocation || '',
      competitors: body.competitors?.map((url: string) => ({ url })) || undefined,
      forceRefresh: body.forceRefresh,
    };
    
    console.log('Parametri validati:', JSON.stringify(requestBody, null, 2));
    const result = await performAnalysis(requestBody);
    res.json(transformToFrontendFormat(result));
  } catch (error) {
    console.error('Errore durante analisi:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Errore durante l'analisi",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SEO audit API running on http://localhost:${PORT}`);
});

