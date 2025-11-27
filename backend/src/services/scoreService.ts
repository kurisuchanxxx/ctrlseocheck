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

  const localScore =
    0.3 * Number(inputs.local.napConsistency) +
    0.2 * Number(inputs.local.mentionsLocation) +
    0.25 * Number(inputs.local.hasLocalSchema) +
    0.15 * Number(inputs.local.hasLocalPages) +
    0.1 * Number(Boolean(inputs.local.googleBusinessProfileUrl));

  const offPageScore =
    0.4 * clamp(inputs.offPage.domainAuthorityScore / 100) +
    0.2 * clamp(inputs.offPage.estimatedBacklinks / 100) +
    0.2 * clamp(inputs.offPage.directoryListings / 50) +
    0.2 * Number(inputs.offPage.hasGoogleBusinessProfile);

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

