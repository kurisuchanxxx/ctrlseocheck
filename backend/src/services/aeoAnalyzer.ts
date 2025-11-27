import { load } from "cheerio";
import { AeoMetrics } from "../types";

export const analyzeAeo = (html: string, baseUrl: string): AeoMetrics => {
  const $ = load(html || "<html></html>");
  const bodyText = $("body").text() || "";
  const bodyHtml = $("body").html() || "";

  // 1. Struttura domanda-risposta
  const qaPatterns = [
    /(?:domanda|question|q:|d:|faq)/i,
    /(?:risposta|answer|a:|r:)/i,
    /(?:come\s+.*\?|what\s+.*\?|why\s+.*\?|when\s+.*\?|where\s+.*\?)/i,
  ];
  const hasQaStructure = qaPatterns.some(pattern => pattern.test(bodyText));
  
  // Conta sezioni Q&A (pattern di domande seguite da risposte)
  const qaSections = (bodyText.match(/(?:domanda|question|q:|come|what|why|when|where).*?(?:risposta|answer|a:)/gi) || []).length;
  
  // 2. Schema markup
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const schemas = Array.isArray(parsed) ? parsed : [parsed];
      schemas.forEach((s: any) => {
        if (s["@type"]) {
          const type = (s["@type"] as string).toLowerCase();
          schemaTypes.push(type);
        }
      });
    } catch {
      // ignore
    }
  });
  
  const hasFaqSchema = schemaTypes.some(t => t.includes("faq") || t.includes("question"));
  const hasHowToSchema = schemaTypes.some(t => t.includes("howto") || t.includes("how-to"));
  const hasArticleSchema = schemaTypes.some(t => t.includes("article") || t.includes("blogposting"));
  
  // Entity markup (Person, Organization, Product, etc.)
  const entityTypes = ["person", "organization", "product", "localbusiness", "restaurant"];
  const entityMarkup = schemaTypes.some(t => entityTypes.some(et => t.includes(et)));
  
  // Rich metadata
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;
  const hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
  const richMetadata = hasOpenGraph || hasTwitterCards || schemaTypes.length > 0;
  
  // 3. Contenuti autorevoli e citabili
  // Statistiche (numeri, percentuali, date)
  const statsPattern = /\d+[%€$]|\d{1,3}(?:\.\d{3})*(?:,\d+)?|(?:circa|circa|oltre|più di|meno di)\s+\d+/i;
  const hasStatistics = statsPattern.test(bodyText);
  
  // Fonti citate
  const sourcesPattern = /(?:fonte|source|riferimento|reference|secondo|secondo\s+.*?|studio|ricerca)/i;
  const hasSources = sourcesPattern.test(bodyText);
  
  // Snippet-ready content (paragrafi brevi 2-3 frasi)
  const paragraphs = $("p").toArray();
  let snippetReadyCount = 0;
  paragraphs.forEach((p) => {
    const text = $(p).text().trim();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2 && sentences.length <= 3 && text.length < 300) {
      snippetReadyCount++;
    }
  });
  
  const hasLists = $("ul, ol").length > 0;
  const hasTables = $("table").length > 0;
  
  // 4. Ottimizzazione semantica
  // Topic depth (paragrafi dedicati all'argomento)
  const headings = $("h1, h2, h3, h4").length;
  const paragraphsCount = paragraphs.length;
  const topicDepth = Math.min(headings + paragraphsCount, 50); // Cap a 50
  
  // Semantic keywords (variazioni trovate nel testo)
  const commonWords = bodyText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const uniqueWords = new Set(commonWords);
  const semanticKeywords = Math.min(uniqueWords.size / 10, 20); // Normalizzato
  
  // Internal links
  const internalLinks = $("a[href]")
    .toArray()
    .filter((a) => {
      const href = $(a).attr("href") || "";
      return href.startsWith("/") || href.startsWith(baseUrl) || !href.startsWith("http");
    }).length;
  
  // Related questions (People Also Ask style)
  const questionWords = ["come", "perché", "quando", "dove", "cosa", "chi", "quale", "quali"];
  const relatedQuestions = questionWords.filter(word => 
    new RegExp(`\\b${word}\\b`, "i").test(bodyText)
  ).length;
  
  // 5. Formato e leggibilità
  const boldKeywords = $("strong, b").length;
  
  // Average sentence length
  const allSentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  const averageSentenceLength = allSentences.length > 0 
    ? Math.round(totalWords / allSentences.length) 
    : 0;
  
  // Average paragraph length (frasi per paragrafo)
  const paragraphSentences = paragraphs.map(p => {
    const text = $(p).text();
    return text.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
  }).filter(n => n > 0);
  const averageParagraphLength = paragraphSentences.length > 0
    ? Math.round(paragraphSentences.reduce((a, b) => a + b, 0) / paragraphSentences.length)
    : 0;
  
  const hasBulletLists = $("ul li").length > 0;
  
  // 6. Autorevolezza del dominio
  // Content freshness (stimato - in produzione si potrebbe usare last-modified header)
  const contentFreshness = 30; // Default: 30 giorni fa (in produzione: calcolare da last-modified)
  
  // Content length (parole)
  const contentLength = totalWords;
  
  // Heading structure
  const h1Count = $("h1").length;
  const headingStructure = h1Count === 1 && headings >= 3; // 1 H1, almeno 3 heading totali

  return {
    hasQaStructure,
    qaSections,
    hasFaqSchema,
    hasHowToSchema,
    hasArticleSchema,
    structuredDataTypes: [...new Set(schemaTypes)],
    entityMarkup,
    richMetadata,
    hasStatistics,
    hasSources,
    snippetReadyContent: snippetReadyCount,
    hasLists,
    hasTables,
    topicDepth,
    semanticKeywords: Math.round(semanticKeywords),
    internalLinks,
    relatedQuestions,
    boldKeywords,
    averageSentenceLength,
    averageParagraphLength,
    hasBulletLists,
    contentFreshness,
    contentLength,
    headingStructure,
  };
};

