import {
  AeoMetrics,
  LocalSeoMetrics,
  OffPageSeoMetrics,
  OnPageSeoMetrics,
  ScoringBreakdown,
  TechnicalSeoMetrics,
} from "../types";

const CATEGORY_WEIGHTS = {
  technical: { weight: 25, max: 25 }, // Ridotto da 30 per fare spazio ad AEO
  onPage: { weight: 25, max: 25 }, // Ridotto da 30
  local: { weight: 20, max: 20 }, // Ridotto da 25
  offPage: { weight: 10, max: 10 }, // Ridotto da 15
  aeo: { weight: 20, max: 20 }, // Nuovo: AEO/RAO
} as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

export interface ScoreInputs {
  technical: TechnicalSeoMetrics;
  onPage: OnPageSeoMetrics;
  local: LocalSeoMetrics;
  offPage: OffPageSeoMetrics;
  aeo: AeoMetrics;
}

export const buildScoring = (inputs: ScoreInputs): ScoringBreakdown => {
  // Se abbiamo metriche PageSpeed, usiamole per un calcolo più accurato
  // Priorità a mobile per SEO (più importante per ranking)
  let technicalScore: number;
  
  if (inputs.technical.pagespeed) {
    const psMobile = inputs.technical.pagespeed.mobile;
    const psDesktop = inputs.technical.pagespeed.desktop;
    
    // Usa mobile per calcolo (più importante per SEO), ma considera anche desktop
    const ps = psMobile; // Priorità mobile
    
    // Calcola score basato su Core Web Vitals e metriche PageSpeed
    // LCP: < 2.5s = 100, > 4s = 0
    const lcpScore = clamp(1 - (ps.coreWebVitals.lcp - 2500) / 1500);
    
    // CLS: < 0.1 = 100, > 0.25 = 0
    const clsScore = clamp(1 - (ps.coreWebVitals.cls - 0.1) / 0.15);
    
    // TBT: < 200ms = 100, > 600ms = 0
    const tbtScore = clamp(1 - (ps.coreWebVitals.tbt - 200) / 400);
    
    // FCP: < 1.8s = 100, > 3s = 0
    const fcpScore = clamp(1 - (ps.metrics.fcp - 1800) / 1200);
    
    // Score composito con pesi per Core Web Vitals
    const coreWebVitalsScore = (
      0.35 * lcpScore +  // LCP è il più importante
      0.25 * clsScore +  // CLS importante per UX
      0.20 * tbtScore +  // TBT importante per interattività
      0.20 * fcpScore    // FCP importante per percezione velocità
    );
    
    // Media mobile/desktop per performance score (60% mobile, 40% desktop)
    const avgPerformanceScore = (psMobile.performanceScore * 0.6 + psDesktop.performanceScore * 0.4) / 100;
    const avgBestPracticesScore = (psMobile.bestPracticesScore * 0.6 + psDesktop.bestPracticesScore * 0.4) / 100;
    
    // Combina con altri fattori
    technicalScore =
      0.10 * Number(inputs.technical.hasSsl) +
      0.10 * Number(inputs.technical.hasSitemap) +
      0.05 * Number(inputs.technical.hasRobots) +
      0.50 * coreWebVitalsScore + // Core Web Vitals pesano 50%
      0.15 * clamp(avgPerformanceScore) + // Performance score media
      0.10 * clamp(avgBestPracticesScore); // Best practices media
  } else {
    // Fallback a calcolo semplificato se PageSpeed non disponibile
    technicalScore =
      0.15 * Number(inputs.technical.hasSsl) +
      0.15 * Number(inputs.technical.hasSitemap) +
      0.1 * Number(inputs.technical.hasRobots) +
      0.25 * clamp(inputs.technical.performanceScore / 100) +
      0.25 * clamp(inputs.technical.mobileFriendlyScore / 100) +
      0.1 * clamp(2000 / Math.max(inputs.technical.averageLoadTimeMs, 1));
  }

  const onPageScore =
    0.25 * (1 - clamp(inputs.onPage.metaTagsMissing.length / 10)) +
    0.2 * clamp(inputs.onPage.imagesWithoutAlt === 0 ? 1 : 1 / (1 + inputs.onPage.imagesWithoutAlt / 5)) +
    0.2 * (inputs.onPage.headings["h1"] > 0 ? 1 : 0) +
    0.15 * (inputs.onPage.canonicalIssues.length === 0 ? 1 : 0) +
    0.2 * clamp(
      1 - (inputs.onPage.brokenInternalLinks + inputs.onPage.brokenExternalLinks) / 10
    );

  // Local SEO migliorato: più generoso e considera anche dati parziali NAP
  const napScore = inputs.local.napConsistency 
    ? 1.0 
    : (inputs.local.napDetails.name ? 0.4 : 0) + 
      (inputs.local.napDetails.address ? 0.3 : 0) + 
      (inputs.local.napDetails.phone ? 0.3 : 0); // Dati parziali NAP
  
  const localScore =
    0.30 * napScore +
    0.25 * Number(inputs.local.hasLocalSchema) +
    0.20 * Number(inputs.local.mentionsLocation) +
    0.15 * Number(inputs.local.hasLocalPages) +
    0.10 * Number(Boolean(inputs.local.googleBusinessProfileUrl));

  // Migliorato: Off-Page score più generoso
  // Domain Authority: 25-70 -> normalizzato a 0-1 (range più realistico per PMI)
  const domainAuthScore = clamp((inputs.offPage.domainAuthorityScore - 25) / 45, 0, 1);
  // Backlinks: 30-150 -> normalizzato (target 60+ per buon punteggio)
  const backlinksScore = clamp(inputs.offPage.estimatedBacklinks / 60, 0, 1);
  // Directory listings: 8-35 -> normalizzato (target 15+ per buon punteggio)
  const directoryScore = clamp(inputs.offPage.directoryListings / 20, 0, 1);
  
  const offPageScore =
    0.35 * domainAuthScore +
    0.25 * backlinksScore +
    0.20 * directoryScore +
    0.20 * Number(inputs.offPage.hasGoogleBusinessProfile);

  // Calcolo score AEO/RAO (MANCANTE - BUG CRITICO!)
  // 1. Struttura Q&A (20%)
  const qaScore = inputs.aeo.hasQaStructure 
    ? 1.0 
    : clamp(inputs.aeo.qaSections / 3, 0, 0.7); // Se non ha struttura ma ha sezioni Q&A
  
  // 2. Schema markup per AI (25%)
  const schemaScore = (
    (inputs.aeo.hasFaqSchema ? 0.4 : 0) +
    (inputs.aeo.hasHowToSchema ? 0.3 : 0) +
    (inputs.aeo.hasArticleSchema ? 0.2 : 0) +
    (inputs.aeo.entityMarkup ? 0.1 : 0)
  );
  
  // 3. Contenuti citabili (20%)
  const citableScore = (
    (inputs.aeo.hasStatistics ? 0.3 : 0) +
    (inputs.aeo.hasSources ? 0.3 : 0) +
    clamp(inputs.aeo.snippetReadyContent / 5, 0, 0.4) // Target: 5+ paragrafi snippet-ready
  );
  
  // 4. Ottimizzazione semantica (15%)
  const semanticScore = (
    clamp(inputs.aeo.topicDepth / 20, 0, 0.4) + // Target: 20+ topic depth
    clamp(inputs.aeo.semanticKeywords / 10, 0, 0.3) + // Target: 10+ keyword semantiche
    clamp(inputs.aeo.internalLinks / 10, 0, 0.2) + // Target: 10+ link interni
    clamp(inputs.aeo.relatedQuestions / 5, 0, 0.1) // Target: 5+ domande correlate
  );
  
  // 5. Formato e leggibilità (10%)
  const readabilityScore = (
    (inputs.aeo.averageSentenceLength > 0 && inputs.aeo.averageSentenceLength <= 20 ? 0.3 : 0) +
    (inputs.aeo.averageParagraphLength > 0 && inputs.aeo.averageParagraphLength <= 4 ? 0.3 : 0) +
    clamp(inputs.aeo.boldKeywords / 5, 0, 0.2) + // Target: 5+ keyword in grassetto
    (inputs.aeo.hasBulletLists ? 0.2 : 0)
  );
  
  // 6. Autorevolezza (10%)
  const authorityScore = (
    (inputs.aeo.contentLength >= 500 ? 0.4 : clamp(inputs.aeo.contentLength / 500, 0, 0.4)) +
    (inputs.aeo.headingStructure ? 0.3 : 0) +
    (inputs.aeo.contentFreshness <= 90 ? 0.3 : clamp(1 - (inputs.aeo.contentFreshness - 90) / 365, 0, 0.3))
  );
  
  const aeoScore = clamp(
    0.20 * qaScore +
    0.25 * schemaScore +
    0.20 * citableScore +
    0.15 * semanticScore +
    0.10 * readabilityScore +
    0.10 * authorityScore,
    0,
    1
  );

  const categories = [
    {
      label: "Technical SEO",
      score: Math.round(technicalScore * CATEGORY_WEIGHTS.technical.max),
      weight: CATEGORY_WEIGHTS.technical.weight,
      max: CATEGORY_WEIGHTS.technical.max,
    },
    {
      label: "On-Page SEO",
      score: Math.round(onPageScore * CATEGORY_WEIGHTS.onPage.max),
      weight: CATEGORY_WEIGHTS.onPage.weight,
      max: CATEGORY_WEIGHTS.onPage.max,
    },
    {
      label: "Local SEO",
      score: Math.round(localScore * CATEGORY_WEIGHTS.local.max),
      weight: CATEGORY_WEIGHTS.local.weight,
      max: CATEGORY_WEIGHTS.local.max,
    },
    {
      label: "Off-Page SEO",
      score: Math.round(offPageScore * CATEGORY_WEIGHTS.offPage.max),
      weight: CATEGORY_WEIGHTS.offPage.weight,
      max: CATEGORY_WEIGHTS.offPage.max,
    },
    {
      label: "AEO/RAO",
      score: Math.round(aeoScore * CATEGORY_WEIGHTS.aeo.max),
      weight: CATEGORY_WEIGHTS.aeo.weight,
      max: CATEGORY_WEIGHTS.aeo.max,
    },
  ];

  const totalScore = Math.min(
    100,
    categories.reduce(
      (acc, cat) => acc + (cat.score / cat.max) * cat.weight,
      0
    )
  );

  return {
    totalScore: Math.round(totalScore),
    categories,
  };
};

