import type { AnalysisResult } from '../types';

// Frontend types (inline to avoid cross-package dependency)
interface TechnicalSEO {
  score: number;
  ssl: { valid: boolean; expiryDate?: string; daysUntilExpiry?: number };
  speed: { score: number; loadTime?: number };
  mobile: { friendly: boolean; viewport: boolean };
  sitemap: boolean;
  robots: boolean;
  brokenLinks: Array<{ url: string; status: number; page: string }>;
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

interface OnPageSEO {
  score: number;
  metaTags: {
    title: Array<{ page: string; present: boolean; length?: number; content?: string }>;
    description: Array<{ page: string; present: boolean; length?: number; content?: string }>;
    ogTags: boolean;
    twitterCards: boolean;
    canonical: boolean;
  };
  headings: { h1: number; h2: number; h3: number; issues: string[] };
  images: { total: number; withoutAlt: number; images: Array<{ url: string; alt: string | null }> };
  content: { averageLength: number; pagesAnalyzed: number };
}

interface LocalSEO {
  score: number;
  nap: {
    name: boolean;
    address: boolean;
    phone: boolean;
    consistent: boolean;
    data?: { name?: string; address?: string; phone?: string };
  };
  localSchema: boolean;
  locationMentions: number;
  locationPages: boolean;
  googleBusiness: boolean;
}

interface OffPageSEO {
  score: number;
  backlinks: number;
  directoryListings: number;
}

interface AeoSEO {
  score: number;
  qaStructure: { present: boolean; sections: number };
  schema: { faq: boolean; howTo: boolean; article: boolean; types: string[] };
  citability: { statistics: boolean; sources: boolean; snippetReady: number };
  semantic: { topicDepth: number; keywords: number; internalLinks: number; questions: number };
  readability: { avgSentenceLength: number; avgParagraphLength: number; boldKeywords: number; hasLists: boolean };
  authority: { contentLength: number; freshness: number; headingStructure: boolean };
}

interface Recommendation {
  id: string;
  category: 'technical' | 'onPage' | 'local' | 'offPage' | 'aeo';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  steps: string[];
  impact: string;
  codeExamples?: string[];
  resources?: Array<{ title: string; url: string; description?: string }>;
  metrics?: {
    current?: number | string;
    target?: number | string;
    unit?: string;
    improvement?: string;
  };
  difficulty?: 'facile' | 'media' | 'avanzata';
  estimatedTime?: string;
  affectedResources?: string[];
}

interface CompetitorAnalysis {
  competitors: Array<{
    url: string;
    domainAuthority: number;
    indexedPages: number;
    speed: number;
    googleBusiness: boolean;
    avgContentLength: number;
  }>;
  comparison: {
    domainAuthority: { [key: string]: number };
    speed: { [key: string]: number };
    contentQuality: { [key: string]: number };
  };
}

interface Summary {
  totalPages: number;
  totalIssues: number;
  quickWins: Recommendation[];
  estimatedTime: string;
}

interface FrontendAnalysisResult {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  technical: TechnicalSEO;
  onPage: OnPageSEO;
  local: LocalSEO;
  offPage: OffPageSEO;
  aeo: AeoSEO;
  recommendations: Recommendation[];
  competitorAnalysis?: CompetitorAnalysis;
  summary: Summary;
}

export function transformToFrontendFormat(backendResult: AnalysisResult): FrontendAnalysisResult {
  const technical: TechnicalSEO = {
    score: Math.round(
      backendResult.scoring.categories.find((c) => c.label === 'Technical SEO')?.score || 0
    ),
    ssl: {
      valid: backendResult.technical.hasSsl,
      expiryDate: backendResult.technical.sslValidUntil,
      daysUntilExpiry: backendResult.technical.sslValidUntil
        ? Math.floor(
            (new Date(backendResult.technical.sslValidUntil).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        : undefined,
    },
    speed: {
      score: backendResult.technical.performanceScore,
      loadTime: backendResult.technical.averageLoadTimeMs,
    },
    mobile: {
      friendly: backendResult.technical.mobileFriendlyScore >= 70,
      viewport: backendResult.technical.mobileFriendlyScore >= 70,
    },
    sitemap: backendResult.technical.hasSitemap,
    robots: backendResult.technical.hasRobots,
    brokenLinks: [],
    pagespeed: backendResult.technical.pagespeed,
  };

  const onPage: OnPageSEO = {
    score: Math.round(
      backendResult.scoring.categories.find((c) => c.label === 'On-Page SEO')?.score || 0
    ),
    metaTags: {
      title: backendResult.onPage.metaTagsMissing.includes('title')
        ? [{ page: 'homepage', present: false }]
        : [{ page: 'homepage', present: true, length: 60, content: 'Title' }],
      description: backendResult.onPage.metaTagsMissing.includes('meta-description')
        ? [{ page: 'homepage', present: false }]
        : [{ page: 'homepage', present: true, length: 140, content: 'Description' }],
      ogTags: !backendResult.onPage.metaTagsMissing.includes('open-graph'),
      twitterCards: !backendResult.onPage.metaTagsMissing.includes('twitter-card'),
      canonical: backendResult.onPage.canonicalIssues.length === 0,
    },
    headings: {
      h1: backendResult.onPage.headings.h1 || 0,
      h2: backendResult.onPage.headings.h2 || 0,
      h3: backendResult.onPage.headings.h3 || 0,
      issues: [],
    },
    images: {
      total: backendResult.onPage.imagesWithoutAlt + 5,
      withoutAlt: backendResult.onPage.imagesWithoutAlt,
      images: [],
    },
    content: {
      averageLength: 500,
      pagesAnalyzed: 1,
    },
  };

  const local: LocalSEO = {
    score: Math.round(
      backendResult.scoring.categories.find((c) => c.label === 'Local SEO')?.score || 0
    ),
    nap: {
      name: Boolean(backendResult.local.napDetails.name),
      address: Boolean(backendResult.local.napDetails.address),
      phone: Boolean(backendResult.local.napDetails.phone),
      consistent: backendResult.local.napConsistency,
      data: backendResult.local.napDetails,
    },
    localSchema: backendResult.local.hasLocalSchema,
    locationMentions: backendResult.local.mentionsLocation ? 1 : 0,
    locationPages: backendResult.local.hasLocalPages,
    googleBusiness: Boolean(backendResult.local.googleBusinessProfileUrl) || backendResult.offPage.hasGoogleBusinessProfile,
  };

  const offPage: OffPageSEO = {
    score: Math.round(
      backendResult.scoring.categories.find((c) => c.label === 'Off-Page SEO')?.score || 0
    ),
    backlinks: backendResult.offPage.estimatedBacklinks,
    directoryListings: backendResult.offPage.directoryListings,
  };

  // Gestisci analisi vecchie senza campo AEO
  const aeoData = backendResult.aeo || {
    hasQaStructure: false,
    qaSections: 0,
    hasFaqSchema: false,
    hasHowToSchema: false,
    hasArticleSchema: false,
    structuredDataTypes: [],
    hasStatistics: false,
    hasSources: false,
    snippetReadyContent: 0,
    topicDepth: 0,
    semanticKeywords: 0,
    internalLinks: 0,
    relatedQuestions: 0,
    averageSentenceLength: 0,
    averageParagraphLength: 0,
    boldKeywords: 0,
    hasBulletLists: false,
    contentLength: 0,
    contentFreshness: 30,
    headingStructure: false,
  };

  const aeo: AeoSEO = {
    score: Math.round(
      backendResult.scoring.categories.find((c) => c.label === 'AEO/RAO')?.score || 0
    ),
    qaStructure: {
      present: aeoData.hasQaStructure,
      sections: aeoData.qaSections,
    },
    schema: {
      faq: aeoData.hasFaqSchema,
      howTo: aeoData.hasHowToSchema,
      article: aeoData.hasArticleSchema,
      types: aeoData.structuredDataTypes || [],
    },
    citability: {
      statistics: aeoData.hasStatistics,
      sources: aeoData.hasSources,
      snippetReady: aeoData.snippetReadyContent,
    },
    semantic: {
      topicDepth: aeoData.topicDepth,
      keywords: aeoData.semanticKeywords,
      internalLinks: aeoData.internalLinks,
      questions: aeoData.relatedQuestions,
    },
    readability: {
      avgSentenceLength: aeoData.averageSentenceLength,
      avgParagraphLength: aeoData.averageParagraphLength,
      boldKeywords: aeoData.boldKeywords,
      hasLists: aeoData.hasBulletLists,
    },
    authority: {
      contentLength: aeoData.contentLength,
      freshness: aeoData.contentFreshness,
      headingStructure: aeoData.headingStructure,
    },
  };

  const recommendations: Recommendation[] = backendResult.recommendations.map((rec) => {
    // Mappa le categorie PageSpeed alle nostre categorie
    let category: 'technical' | 'onPage' | 'local' | 'offPage' | 'aeo' = 'onPage';
    if (rec.category) {
      if (rec.category === 'performance' || rec.category === 'accessibility' || rec.category === 'best-practices') {
        category = 'technical';
      } else if (rec.category === 'local') {
        category = 'local';
      } else if (rec.category === 'seo') {
        category = 'onPage';
      } else if (rec.category === 'aeo') {
        category = 'aeo';
      }
    } else {
      // Fallback basato sul titolo
      if (rec.title.toLowerCase().includes('ssl') || rec.title.toLowerCase().includes('velocità') || rec.title.toLowerCase().includes('lcp') || rec.title.toLowerCase().includes('cls') || rec.title.toLowerCase().includes('tbt') || rec.title.toLowerCase().includes('compressione') || rec.title.toLowerCase().includes('render-blocking')) {
        category = 'technical';
      } else if (rec.title.toLowerCase().includes('nap') || rec.title.toLowerCase().includes('local') || rec.title.toLowerCase().includes('schema')) {
        category = 'local';
      } else if (rec.title.toLowerCase().includes('backlink') || rec.title.toLowerCase().includes('autorità')) {
        category = 'offPage';
      } else if (rec.title.toLowerCase().includes('aeo') || rec.title.toLowerCase().includes('rao') || rec.title.toLowerCase().includes('answer engine') || rec.title.toLowerCase().includes('domanda-risposta')) {
        category = 'aeo';
      }
    }
    
    return {
      id: rec.id,
      category,
      priority: rec.priority === 'alta' ? 'high' : rec.priority === 'media' ? 'medium' : 'low',
      title: rec.title,
      description: rec.description,
      steps: rec.steps,
      impact: rec.impact === 'alto' ? 'Alto impatto sul ranking' : rec.impact === 'medio' ? 'Impatto medio sul ranking' : 'Impatto basso sul ranking',
      codeExamples: rec.codeExamples,
      resources: rec.resources,
      metrics: rec.metrics,
      difficulty: rec.difficulty,
      estimatedTime: rec.estimatedTime,
      affectedResources: rec.affectedResources,
    };
  });

  const competitorAnalysis: CompetitorAnalysis | undefined = backendResult.competitors.length > 0
    ? {
        competitors: backendResult.competitors.map((comp) => ({
          url: comp.url,
          domainAuthority: comp.domainAuthority,
          indexedPages: comp.indexedPages,
          speed: comp.speedScore,
          googleBusiness: comp.hasGoogleBusiness,
          avgContentLength: comp.contentQuality * 100,
        })),
        comparison: {
          domainAuthority: Object.fromEntries(
            backendResult.competitors.map((c) => [c.url, c.domainAuthority])
          ),
          speed: Object.fromEntries(
            backendResult.competitors.map((c) => [c.url, c.speedScore])
          ),
          contentQuality: Object.fromEntries(
            backendResult.competitors.map((c) => [c.url, c.contentQuality * 100])
          ),
        },
      }
    : undefined;

  const summary: Summary = {
    totalPages: 1,
    totalIssues: backendResult.recommendations.length,
    quickWins: recommendations
      .filter((r) => r.priority === 'high')
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        category: r.category,
        priority: r.priority,
        title: r.title,
        description: r.description,
        steps: r.steps,
        impact: r.impact,
      })),
    estimatedTime: `${backendResult.summary.estimatedTimelineWeeks} settimane`,
  };

  return {
    id: backendResult.id,
    url: backendResult.url,
    timestamp: backendResult.timestamp,
    score: backendResult.scoring.totalScore,
    technical,
    onPage,
    local,
    offPage,
    aeo,
    recommendations,
    competitorAnalysis,
    summary,
  };
}

