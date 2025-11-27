export type PriorityLevel = "alta" | "media" | "bassa";

export interface CompetitorInput {
  url: string;
}

export interface AnalysisRequestBody {
  url: string;
  businessType: string;
  location: string;
  competitors?: CompetitorInput[];
  forceRefresh?: boolean;
}

export interface TechnicalSeoMetrics {
  hasSsl: boolean;
  sslValidUntil?: string;
  hasSitemap: boolean;
  hasRobots: boolean;
  performanceScore: number;
  mobileFriendlyScore: number;
  averageLoadTimeMs: number;
  // PageSpeed Insights metrics (opzionali) - separati per mobile e desktop
  pagespeed?: {
    mobile: {
      performanceScore: number;
      accessibilityScore: number;
      bestPracticesScore: number;
      seoScore: number;
      coreWebVitals: {
        lcp: number;
        fid: number;
        cls: number;
        tbt: number;
      };
      metrics: {
        fcp: number;
        si: number;
        tti: number;
        serverResponseTime: number;
      };
      optimizations: {
        renderBlockingResources: number;
        unoptimizedImages: number;
        textCompression: boolean;
        responsiveImages: boolean;
        modernImageFormats: boolean;
      };
    };
    desktop: {
      performanceScore: number;
      accessibilityScore: number;
      bestPracticesScore: number;
      seoScore: number;
      coreWebVitals: {
        lcp: number;
        fid: number;
        cls: number;
        tbt: number;
      };
      metrics: {
        fcp: number;
        si: number;
        tti: number;
        serverResponseTime: number;
      };
      optimizations: {
        renderBlockingResources: number;
        unoptimizedImages: number;
        textCompression: boolean;
        responsiveImages: boolean;
        modernImageFormats: boolean;
      };
    };
  };
}

export interface OnPageSeoMetrics {
  metaTagsMissing: string[];
  headings: Record<string, number>;
  imagesWithoutAlt: number;
  brokenInternalLinks: number;
  brokenExternalLinks: number;
  canonicalIssues: string[];
  schemaMarkupTypes: string[];
}

export interface LocalSeoMetrics {
  napConsistency: boolean;
  napDetails: {
    name?: string;
    address?: string;
    phone?: string;
  };
  mentionsLocation: boolean;
  hasLocalPages: boolean;
  hasLocalSchema: boolean;
  googleBusinessProfileUrl?: string;
}

export interface OffPageSeoMetrics {
  estimatedBacklinks: number;
  directoryListings: number;
  domainAuthorityScore: number;
  hasGoogleBusinessProfile: boolean;
}

export interface AeoMetrics {
  // 1. Struttura domanda-risposta
  hasQaStructure: boolean;
  qaSections: number; // Numero di sezioni domanda-risposta trovate
  hasFaqSchema: boolean;
  hasHowToSchema: boolean;
  hasArticleSchema: boolean;
  
  // 2. Schema markup e dati strutturati
  structuredDataTypes: string[]; // Tipi di schema trovati
  entityMarkup: boolean; // Markup per entità (persone, aziende, prodotti)
  richMetadata: boolean; // Metadati ricchi presenti
  
  // 3. Contenuti autorevoli e citabili
  hasStatistics: boolean; // Presenza di statistiche/dati numerici
  hasSources: boolean; // Fonti citate
  snippetReadyContent: number; // Paragrafi brevi e informativi (2-3 frasi)
  hasLists: boolean; // Liste presenti
  hasTables: boolean; // Tabelle presenti
  
  // 4. Ottimizzazione semantica
  topicDepth: number; // Profondità dell'argomento (paragrafi dedicati)
  semanticKeywords: number; // Variazioni di keyword trovate
  internalLinks: number; // Link interni a concetti correlati
  relatedQuestions: number; // Domande correlate coperte
  
  // 5. Formato e leggibilità
  boldKeywords: number; // Concetti chiave in grassetto
  averageSentenceLength: number; // Lunghezza media frasi
  averageParagraphLength: number; // Frasi per paragrafo
  hasBulletLists: boolean; // Liste puntate presenti
  
  // 6. Autorevolezza del dominio
  contentFreshness: number; // Giorni dall'ultimo aggiornamento (stimato)
  contentLength: number; // Lunghezza totale contenuto (parole)
  headingStructure: boolean; // Struttura heading ben organizzata
}

export interface CategoryScore {
  label: string;
  score: number;
  weight: number;
  max: number;
}

export interface ScoringBreakdown {
  totalScore: number;
  categories: CategoryScore[];
}

export interface ActionableRecommendation {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  impact: "alto" | "medio" | "basso";
  steps: string[];
  evidence: string;
  // Dettagli aggiuntivi (simili a PageSpeed Insights)
  codeExamples?: string[]; // Esempi di codice HTML/JS/CSS
  resources?: Array<{ title: string; url: string; description?: string }>; // Link a risorse utili
  metrics?: {
    current?: number | string;
    target?: number | string;
    unit?: string;
    improvement?: string; // Stima miglioramento atteso
  };
  difficulty?: "facile" | "media" | "avanzata";
  estimatedTime?: string; // Tempo stimato per implementazione
  category?: "performance" | "seo" | "accessibility" | "best-practices" | "local" | "technical" | "onPage" | "offPage" | "aeo";
  affectedResources?: string[]; // Risorse specifiche coinvolte
}

export interface CompetitorComparison {
  url: string;
  domainAuthority: number;
  indexedPages: number;
  speedScore: number;
  contentQuality: number;
  hasGoogleBusiness: boolean;
}

export interface AnalysisResult {
  id: string;
  url: string;
  businessType: string;
  location: string;
  timestamp: string;
  technical: TechnicalSeoMetrics;
  onPage: OnPageSeoMetrics;
  local: LocalSeoMetrics;
  offPage: OffPageSeoMetrics;
  aeo: AeoMetrics; // Answer Engine Optimization / Retrieval-Augmented Optimization
  scoring: ScoringBreakdown;
  recommendations: ActionableRecommendation[];
  competitors: CompetitorComparison[];
  summary: {
    highlights: string[];
    quickWins: string[];
    estimatedTimelineWeeks: number;
  };
}

