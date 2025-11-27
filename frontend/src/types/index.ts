export interface AnalysisRequest {
  url: string;
  businessSector: string;
  targetLocation: string;
  competitors?: string[];
}

export interface AeoSEO {
  score: number;
  qaStructure: { present: boolean; sections: number };
  schema: { faq: boolean; howTo: boolean; article: boolean; types: string[] };
  citability: { statistics: boolean; sources: boolean; snippetReady: number };
  semantic: { topicDepth: number; keywords: number; internalLinks: number; questions: number };
  readability: { avgSentenceLength: number; avgParagraphLength: number; boldKeywords: number; hasLists: boolean };
  authority: { contentLength: number; freshness: number; headingStructure: boolean };
}

export interface AnalysisResult {
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

export interface TechnicalSEO {
  score: number;
  ssl: SSLCheck;
  speed: SpeedCheck;
  mobile: MobileCheck;
  sitemap: boolean;
  robots: boolean;
  brokenLinks: BrokenLink[];
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

export interface OnPageSEO {
  score: number;
  metaTags: MetaTags;
  headings: HeadingStructure;
  images: ImageCheck;
  content: ContentCheck;
}

export interface LocalSEO {
  score: number;
  nap: NAPCheck;
  localSchema: boolean;
  locationMentions: number;
  locationPages: boolean;
  googleBusiness: boolean;
}

export interface OffPageSEO {
  score: number;
  backlinks: number;
  directoryListings: number;
}

export interface SSLCheck {
  valid: boolean;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

export interface SpeedCheck {
  score: number;
  loadTime?: number;
}

export interface MobileCheck {
  friendly: boolean;
  viewport: boolean;
}

export interface BrokenLink {
  url: string;
  status: number;
  page: string;
}

export interface MetaTags {
  title: MetaTagCheck[];
  description: MetaTagCheck[];
  ogTags: boolean;
  twitterCards: boolean;
  canonical: boolean;
}

export interface MetaTagCheck {
  page: string;
  present: boolean;
  length?: number;
  content?: string;
}

export interface HeadingStructure {
  h1: number;
  h2: number;
  h3: number;
  issues: string[];
}

export interface ImageCheck {
  total: number;
  withoutAlt: number;
  images: Array<{ url: string; alt: string | null }>;
}

export interface ContentCheck {
  averageLength: number;
  pagesAnalyzed: number;
}

export interface NAPCheck {
  name: boolean;
  address: boolean;
  phone: boolean;
  consistent: boolean;
  data?: {
    name?: string;
    address?: string;
    phone?: string;
  };
}

export interface Recommendation {
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

export interface CompetitorAnalysis {
  competitors: CompetitorData[];
  comparison: ComparisonData;
}

export interface CompetitorData {
  url: string;
  domainAuthority: number;
  indexedPages: number;
  speed: number;
  googleBusiness: boolean;
  avgContentLength: number;
}

export interface ComparisonData {
  domainAuthority: { [key: string]: number };
  speed: { [key: string]: number };
  contentQuality: { [key: string]: number };
}

export interface Summary {
  totalPages: number;
  totalIssues: number;
  quickWins: Recommendation[];
  estimatedTime: string;
}

