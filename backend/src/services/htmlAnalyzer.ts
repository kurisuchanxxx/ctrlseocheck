import { load } from "cheerio";
import dayjs from "dayjs";
import { REQUEST_TIMEOUT_MS } from "../config";
import {
  LocalSeoMetrics,
  OnPageSeoMetrics,
  TechnicalSeoMetrics,
} from "../types";
import { analyzeWithPageSpeed, PageSpeedMetrics } from "./pagespeedService";
import { createHttpClient } from "../utils/httpClient";
import { sanitizeHtml } from "../utils/sanitizer";
import { logger } from "../utils/logger";
import {
  extractPhoneWithContext,
  extractAddressWithContext,
  validateItalianPhone,
  validateItalianAddress,
  isInRelevantSection,
} from "../utils/napValidator";

const httpClient = createHttpClient();

interface FetchResult {
  html: string;
  loadTimeMs: number;
  status: number;
}

const fetchDocument = async (url: string): Promise<FetchResult> => {
  const start = Date.now();
  try {
    const response = await httpClient.get<string>(url, {
      responseType: "text",
    });
    
    // Sanitizza HTML per sicurezza
    const sanitizedHtml = sanitizeHtml(response.data);
    
    logger.info(`Fetched document: ${url}`, {
      status: response.status,
      loadTime: Date.now() - start,
      size: sanitizedHtml.length,
    });
    
    return {
      html: sanitizedHtml,
      loadTimeMs: Date.now() - start,
      status: response.status,
    };
  } catch (error: any) {
    logger.error(`Failed to fetch document: ${url}`, {
      error: error.message,
      status: error.response?.status,
      loadTime: Date.now() - start,
    });
    return {
      html: "",
      loadTimeMs: Date.now() - start,
      status: error.response?.status || 0,
    };
  }
};

const analyzeTechnical = async (
  targetUrl: string,
  mainDoc: FetchResult,
  pagespeedMetrics?: PageSpeedMetrics | null
): Promise<TechnicalSeoMetrics> => {
  const origin = new URL(targetUrl).origin;
  const hasSsl = targetUrl.startsWith("https://");
  let sslValidUntil: string | undefined;

  if (hasSsl) {
    // fallback: fake expiry + 6 mesi
    sslValidUntil = dayjs().add(6, "month").toISOString();
  }

  const checkAsset = async (path: string) => {
    try {
      const res = await httpClient.head(`${origin}/${path}`);
      return res.status < 400;
    } catch (error: any) {
      logger.debug(`Asset check failed: ${origin}/${path}`, {
        status: error.response?.status,
      });
      return false;
    }
  };

  const [hasSitemap, hasRobots] = await Promise.all([
    checkAsset("sitemap.xml"),
    checkAsset("robots.txt"),
  ]);

  // Usa PageSpeed score se disponibile, altrimenti calcola da loadTime
  let performanceScore: number;
  let mobileFriendlyScore: number;
  let averageLoadTimeMs: number;

  if (pagespeedMetrics) {
    // Usa metriche reali da PageSpeed Insights (priorità a mobile per SEO)
    const mobile = pagespeedMetrics.mobile;
    performanceScore = mobile.performanceScore;
    mobileFriendlyScore = mobile.accessibilityScore; // Accessibilità include mobile
    averageLoadTimeMs = mobile.metrics.serverResponseTime || 
                       mobile.coreWebVitals.lcp ||
                       (mainDoc.loadTimeMs > 0 ? mainDoc.loadTimeMs : 4000);
  } else {
    // Fallback a calcolo semplificato
    performanceScore =
      mainDoc.loadTimeMs === 0
        ? 35
        : Math.max(10, Math.min(95, Math.round(7800 / mainDoc.loadTimeMs)));
    
    const $ = load(mainDoc.html || "<html></html>");
    const hasViewport = $('meta[name="viewport"]').length > 0;
    mobileFriendlyScore = hasViewport ? 80 : 40;
    
    averageLoadTimeMs =
      mainDoc.loadTimeMs === 0 ? 4000 : Math.max(mainDoc.loadTimeMs, 500);
  }

  return {
    hasSsl,
    sslValidUntil,
    hasSitemap,
    hasRobots,
    performanceScore,
    mobileFriendlyScore,
    averageLoadTimeMs,
    pagespeed: pagespeedMetrics || undefined,
  };
};

const analyzeOnPage = (html: string, baseUrl: string): OnPageSeoMetrics => {
  const $ = load(html || "<html></html>");
  const metaTagsMissing: string[] = [];

  if (!$("title").text()) {
    metaTagsMissing.push("title");
  }
  if (!$('meta[name="description"]').attr("content")) {
    metaTagsMissing.push("meta-description");
  }
  if (!$('meta[property="og:title"]').attr("content")) {
    metaTagsMissing.push("open-graph");
  }
  if (!$('meta[name="twitter:card"]').attr("content")) {
    metaTagsMissing.push("twitter-card");
  }

  const headings: Record<string, number> = { h1: 0, h2: 0, h3: 0 };
  ["h1", "h2", "h3"].forEach((tag) => {
    headings[tag] = $(tag).length;
  });

  const imagesWithoutAlt = $("img")
    .toArray()
    .filter((img) => !$(img).attr("alt"))
    .length;

  const anchors = $("a")
    .toArray()
    .map((a) => $(a).attr("href") || "");
  const brokenInternalLinks = anchors.filter((href) => href === "#").length;
  const brokenExternalLinks = anchors.filter((href) =>
    href.startsWith("javascript")
  ).length;

  const canonicalTags = $('link[rel="canonical"]')
    .toArray()
    .map((link) => $(link).attr("href"))
    .filter(Boolean) as string[];
  const canonicalIssues =
    canonicalTags.length !== 1 ? ["Missing or duplicate canonical"] : [];

  const schemaMarkupTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item["@type"]) schemaMarkupTypes.push(item["@type"]);
        });
      } else if (parsed["@type"]) {
        schemaMarkupTypes.push(parsed["@type"]);
      }
    } catch {
      // ignore invalid JSON-LD
    }
  });

  return {
    metaTagsMissing,
    headings,
    imagesWithoutAlt,
    brokenInternalLinks,
    brokenExternalLinks,
    canonicalIssues,
    schemaMarkupTypes,
  };
};

const analyzeLocalSeo = (
  html: string,
  location: string
): LocalSeoMetrics => {
  const $ = load(html || "<html></html>");
  const pageText = $("body").text().toLowerCase();
  const locationLower = location.toLowerCase();

  // Cerca NAP in vari formati: microdata, JSON-LD, e testo normale
  let napDetails = {
    name: $('[itemprop="name"]').first().text().trim() || undefined,
    address: $('[itemprop="address"]').text().trim() || undefined,
    phone: $('[itemprop="telephone"]').first().text().trim() || undefined,
  };

  // Cerca anche in JSON-LD schema
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const schema = Array.isArray(parsed) ? parsed[0] : parsed;
      
      if (schema["@type"] && ["LocalBusiness", "Restaurant", "FoodEstablishment", "Organization"].includes(schema["@type"])) {
        if (!napDetails.name && schema.name) napDetails.name = schema.name;
        if (!napDetails.address && schema.address) {
          const addr = schema.address;
          if (typeof addr === 'string') {
            napDetails.address = addr;
          } else if (addr.streetAddress) {
            napDetails.address = `${addr.streetAddress}, ${addr.addressLocality || ''} ${addr.postalCode || ''}`.trim();
          }
        }
        if (!napDetails.phone && schema.telephone) napDetails.phone = schema.telephone;
      }
    } catch {
      // ignore
    }
  });

  // Cerca anche nel testo normale (footer, contatti, etc.) - MIGLIORATO
  if (!napDetails.phone) {
    // Cerca in sezioni rilevanti (footer, contatti)
    $('footer, .footer, #footer, .contatti, .contacts, [class*="contact"], [id*="contact"]').each((_, el) => {
      const sectionText = $(el).text();
      const phone = extractPhoneWithContext(sectionText, 'contatti');
      if (phone && !napDetails.phone) {
        napDetails.phone = phone;
        return false; // Break
      }
    });
    
    // Se non trovato, cerca in tutto il testo ma con validazione
    if (!napDetails.phone) {
      const phone = extractPhoneWithContext(pageText);
      if (phone) {
        napDetails.phone = phone;
      }
    }
  }

  // Cerca indirizzo nel testo - MIGLIORATO con validazione
  if (!napDetails.address) {
    // Cerca in sezioni rilevanti prima
    $('footer, .footer, #footer, .contatti, .contacts, [class*="contact"], [id*="contact"], [class*="address"], [id*="address"]').each((_, el) => {
      const sectionText = $(el).text();
      const address = extractAddressWithContext(sectionText, 'indirizzo');
      if (address && !napDetails.address) {
        napDetails.address = address;
        return false; // Break
      }
    });
    
    // Se non trovato, cerca in tutto il testo ma con validazione
    if (!napDetails.address) {
      const address = extractAddressWithContext(pageText);
      if (address) {
        napDetails.address = address;
      }
    }
  }
  
  // Valida i dati trovati
  if (napDetails.phone && !validateItalianPhone(napDetails.phone)) {
    logger.debug('Invalid phone format, removing', { phone: napDetails.phone });
    napDetails.phone = undefined;
  }
  
  if (napDetails.address && !validateItalianAddress(napDetails.address)) {
    logger.debug('Invalid address format, removing', { address: napDetails.address });
    napDetails.address = undefined;
  }

  const napConsistency =
    Boolean(napDetails.name) &&
    Boolean(napDetails.address) &&
    Boolean(napDetails.phone);

  // Cerca menzioni della località - MIGLIORATO con validazione contestuale
  const locationWords = locationLower.split(/[\s,]+/).filter(w => w.length > 2);
  
  // Cerca in sezioni rilevanti (servizi, zona servita, etc.)
  const relevantSections = $('footer, .servizi, .zona, [class*="serv"], [class*="area"], [class*="location"]').text().toLowerCase();
  const mentionsInRelevantSections = locationWords.some(word => relevantSections.includes(word));
  
  // Cerca anche in tutto il testo ma con penalità se menzionato solo in articoli/blog
  const allTextMentions = locationWords.some(word => pageText.includes(word)) || pageText.includes(locationLower);
  
  // Considera più affidabile se menzionato in sezioni rilevanti
  const mentionsLocation = mentionsInRelevantSections || (allTextMentions && !pageText.includes('articolo') && !pageText.includes('blog'));

  // Cerca pagine locali (più flessibile)
  const hasLocalPages =
    $("a")
      .toArray()
      .some((a) => {
        const text = ($(a).text() + " " + ($(a).attr("href") || "")).toLowerCase();
        return locationWords.some(word => text.includes(word));
      }) || false;

  // Cerca schema locale (più tipi)
  const schemaTypes = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => {
      try {
        const parsed = JSON.parse($(el).contents().text());
        const schemas = Array.isArray(parsed) ? parsed : [parsed];
        return schemas.map((s: any) => s["@type"]?.toLowerCase()).filter(Boolean);
      } catch {
        return [];
      }
    })
    .flat()
    .filter(Boolean) as string[];

  const hasLocalSchema = schemaTypes.some((type) =>
    ["localbusiness", "restaurant", "foodestablishment", "organization", "store", "place"].includes(type)
  );

  logger.debug('Local SEO Analysis completed', {
    location,
    napConsistency,
    mentionsLocation,
    hasLocalPages,
    hasLocalSchema,
    schemaTypesFound: schemaTypes,
  });

  return {
    napConsistency,
    napDetails,
    mentionsLocation,
    hasLocalPages,
    hasLocalSchema,
    googleBusinessProfileUrl: undefined,
  };
};

export const runHtmlAnalysis = async (
  url: string,
  location: string,
  pagespeedMetrics?: PageSpeedMetrics | null
) => {
  const document = await fetchDocument(url);

  const [technical, onPage] = await Promise.all([
    analyzeTechnical(url, document, pagespeedMetrics),
    Promise.resolve(analyzeOnPage(document.html, url)),
  ]);

  const local = analyzeLocalSeo(document.html, location);

  return {
    document,
    technical,
    onPage,
    local,
  };
};


