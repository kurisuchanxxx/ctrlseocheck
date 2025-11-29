import { load } from "cheerio";
import { AeoMetrics } from "../types";

export const analyzeAeo = (html: string, baseUrl: string): AeoMetrics => {
  const $ = load(html || "<html></html>");
  const bodyText = $("body").text() || "";
  const bodyHtml = $("body").html() || "";

  // 2. Schema markup (prima per poterlo usare dopo)
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
  
  // 1. Struttura domanda-risposta - MIGLIORATO con validazione contestuale
  // Cerca pattern Q&A strutturati (domanda seguita da risposta)
  const qaStructuredPatterns = [
    // Pattern espliciti: "Domanda: ... Risposta: ..."
    /(?:domanda|question|q:|d:|faq|f\.a\.q\.)\s*:?\s*[^?]+\?(?:\s*[^?]+(?:risposta|answer|a:|r:|soluzione|risultato))/gi,
    // Pattern impliciti: domanda seguita da risposta nella stessa sezione
    /(?:come|what|why|when|where|chi|quale|quali|perché|perchè)\s+[^?]+\?[^?]{20,200}(?:è|sono|si|può|deve|bisogna)/gi,
  ];
  
  // Conta sezioni Q&A strutturate
  let qaSections = 0;
  qaStructuredPatterns.forEach(pattern => {
    const matches = bodyText.match(pattern);
    if (matches) qaSections += matches.length;
  });
  
  // Cerca anche in elementi strutturati (dl, FAQ schema, etc.)
  const faqElements = $('dl, [itemtype*="FAQ"], [class*="faq"], [id*="faq"]').length;
  qaSections += faqElements;
  
  // Verifica presenza di FAQ schema
  const hasFaqSchemaInCode = schemaTypes.some(t => t.includes("faq") || t.includes("question"));
  if (hasFaqSchemaInCode) qaSections += 2; // Bonus per schema strutturato
  
  // Conta domande totali (per stima)
  const questionCount = (bodyText.match(/\?/g) || []).length;
  // Se ci sono molte domande ma poche sezioni strutturate, stima basata su domande
  if (qaSections === 0 && questionCount >= 3) {
    qaSections = Math.floor(questionCount / 3); // Almeno 1 sezione ogni 3 domande
  }
  
  const hasQaStructure = qaSections > 0 || hasFaqSchemaInCode;
  
  // 3. Contenuti autorevoli e citabili - MIGLIORATO con validazione contestuale
  // Statistiche con contesto (non solo numeri, ma numeri con significato)
  const statsPatterns = [
    // Percentuali con contesto
    /\d+%\s+(?:dei|delle|degli|del|della|in|su|per|con|secondo|secondo\s+.*?)/i,
    // Numeri con unità di misura rilevanti
    /\d+\s*(?:anni|mesi|giorni|ore|minuti|secondi|clienti|visitatori|ordini|prodotti|utenti|iscritti|iscrizioni|prenotazioni|recensioni|voti|stelle|rating)/i,
    // Valori monetari
    /\d+[€$£]\s*(?:in|per|di|su|circa|oltre|più di|meno di)/i,
    // Numeri grandi con contesto (migliaia, milioni)
    /\d{1,3}(?:\.\d{3})+\s*(?:persone|utenti|clienti|visitatori|prodotti|servizi|ordini|prenotazioni)/i,
    // Statistiche comparative
    /(?:circa|oltre|più di|meno di|supera|raggiunge|oltre|fino a|almeno)\s+\d+\s*(?:persone|utenti|clienti|visitatori|prodotti|servizi|ordini|prenotazioni|%)/i,
  ];
  
  let hasStatistics = false;
  let statsCount = 0;
  statsPatterns.forEach(pattern => {
    const matches = bodyText.match(pattern);
    if (matches) {
      statsCount += matches.length;
      hasStatistics = true;
    }
  });
  
  // Richiede almeno 2 statistiche per essere considerato significativo
  if (statsCount < 2) hasStatistics = false;
  
  // Fonti citate - MIGLIORATO con pattern più specifici
  const sourcesPatterns = [
    // Citazioni esplicite
    /(?:fonte|source|riferimento|reference):\s*[^\n]{10,100}/i,
    // Citazioni con "secondo"
    /secondo\s+(?:uno\s+)?(?:studio|ricerca|indagine|analisi|report|dati|statistiche|fonte|sito|articolo|pubblicazione)/i,
    // Citazioni con "come riportato"
    /(?:come|secondo)\s+(?:riportato|indicato|mostrato|dimostrato|pubblicato|rivelato)\s+(?:da|da|in|su)/i,
    // Riferimenti a studi/ricerche
    /(?:studio|ricerca|indagine|analisi|report|dati|statistiche)\s+(?:condotto|pubblicato|realizzato|effettuato)\s+(?:da|da|in|su)/i,
    // Link a fonti (href con pattern di fonti)
    /href=["'][^"']*(?:studio|ricerca|fonte|source|reference|pubblicazione|articolo|paper)/i,
  ];
  
  let hasSources = false;
  let sourcesCount = 0;
  sourcesPatterns.forEach(pattern => {
    const matches = bodyText.match(pattern);
    if (matches) {
      sourcesCount += matches.length;
      hasSources = true;
    }
  });
  
  // Richiede almeno 1 fonte esplicita per essere considerato significativo
  if (sourcesCount === 0) hasSources = false;
  
  // Snippet-ready content - MIGLIORATO con validazione qualità
  const paragraphs = $("p").toArray();
  let snippetReadyCount = 0;
  paragraphs.forEach((p) => {
    const text = $(p).text().trim();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Criteri per snippet-ready:
    // 1. 2-3 frasi (non troppo breve, non troppo lungo)
    // 2. Lunghezza totale 50-300 caratteri (ideale per snippet)
    // 3. Contiene informazioni concrete (non solo filler)
    // 4. Inizia con maiuscola (probabilmente inizio paragrafo)
    const isGoodLength = sentences.length >= 2 && sentences.length <= 3;
    const isGoodSize = text.length >= 50 && text.length < 300;
    const hasConcreteInfo = /(?:è|sono|si|può|deve|bisogna|include|contiene|offre|fornisce|garantisce)/i.test(text);
    const startsProperly = /^[A-ZÀÈÉÌÒÙ]/.test(text);
    
    if (isGoodLength && isGoodSize && hasConcreteInfo && startsProperly) {
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
  
  // Related questions (People Also Ask style) - più generoso
  const questionWords = ["come", "perché", "quando", "dove", "cosa", "chi", "quale", "quali", "quanto", "quanti", "quante"];
  const questionPattern = new RegExp(`\\b(?:${questionWords.join('|')})\\b`, "gi");
  const relatedQuestions = Math.min((bodyText.match(questionPattern) || []).length, 10); // Cap a 10
  
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

