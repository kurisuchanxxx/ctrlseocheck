import { v4 as uuid } from "uuid";
import {
  ActionableRecommendation,
  AeoMetrics,
  LocalSeoMetrics,
  OffPageSeoMetrics,
  OnPageSeoMetrics,
  TechnicalSeoMetrics,
} from "../types";

const priorityMap = {
  alta: { label: "Alta", impact: "alto" },
  media: { label: "Media", impact: "medio" },
  bassa: { label: "Bassa", impact: "basso" },
} as const;

export interface RecommendationInputs {
  technical: TechnicalSeoMetrics;
  onPage: OnPageSeoMetrics;
  local: LocalSeoMetrics;
  offPage: OffPageSeoMetrics;
  aeo: AeoMetrics;
}

export const buildRecommendations = ({
  technical,
  onPage,
  local,
  offPage,
  aeo,
}: RecommendationInputs): ActionableRecommendation[] => {
  const recommendations: ActionableRecommendation[] = [];

  if (!technical.hasSsl) {
    recommendations.push({
      id: uuid(),
      title: "Attiva certificato SSL (HTTPS)",
      description:
        "Il sito non risulta servito in HTTPS. Google penalizza i siti HTTP e gli utenti vedono un avviso 'Non sicuro' nel browser. HTTPS è essenziale per fiducia, ranking e sicurezza dei dati.",
      priority: "alta",
      impact: priorityMap.alta.impact,
      steps: [
        "Verifica con l'hosting la disponibilità di certificati SSL gratuiti (Let's Encrypt è gratuito e automatico).",
        "Installa il certificato SSL tramite il pannello di controllo dell'hosting (cPanel, Plesk, o direttamente dal provider).",
        "Forza redirect 301 da HTTP a HTTPS: configura il server per reindirizzare automaticamente tutte le richieste HTTP a HTTPS.",
        "Aggiorna tutti i link interni: cambia tutti i link da http:// a https:// nel sito.",
        "Aggiorna sitemap.xml: cambia tutti gli URL da HTTP a HTTPS.",
        "Invia sitemap aggiornata in Google Search Console con URL HTTPS.",
        "Verifica certificato: usa SSL Labs SSL Test per verificare che il certificato sia valido e configurato correttamente.",
      ],
      evidence: "Certificato SSL non rilevato o non valido - sito servito in HTTP",
      codeExamples: [
        "<!-- Apache .htaccess - Redirect HTTP to HTTPS -->\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
        "# Nginx - Redirect HTTP to HTTPS\nserver {\n  listen 80;\n  server_name example.com;\n  return 301 https://$server_name$request_uri;\n}",
        "<!-- WordPress functions.php -->\nadd_action('template_redirect', function() {\n  if (!is_ssl()) {\n    wp_redirect('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'], 301);\n    exit();\n  }\n});",
      ],
      resources: [
        { title: "Let's Encrypt", url: "https://letsencrypt.org/", description: "Certificati SSL gratuiti e automatici" },
        { title: "SSL Labs SSL Test", url: "https://www.ssllabs.com/ssltest/", description: "Testa la configurazione SSL del tuo sito" },
        { title: "Guida Google: HTTPS", url: "https://developers.google.com/search/docs/advanced/security/https", description: "Importanza di HTTPS per SEO" },
        { title: "Cloudflare SSL", url: "https://www.cloudflare.com/ssl/", description: "SSL gratuito con Cloudflare" },
      ],
      metrics: {
        current: "HTTP (non sicuro)",
        target: "HTTPS (sicuro)",
        improvement: "Miglioramento ranking atteso: +5-10% (Google favorisce HTTPS)",
      },
      difficulty: "facile",
      estimatedTime: "30 minuti - 1 ora",
      category: "technical",
    });
  }

  // Raccomandazioni basate su PageSpeed Insights se disponibili
  // Usa mobile per le raccomandazioni (più importante per SEO)
  if (technical.pagespeed) {
    const ps = technical.pagespeed.mobile; // Priorità mobile per SEO
    
    // Core Web Vitals issues
    if (ps.coreWebVitals.lcp > 4000) {
      const lcpImprovement = Math.round(((ps.coreWebVitals.lcp - 2500) / ps.coreWebVitals.lcp) * 100);
      recommendations.push({
        id: uuid(),
        title: "Ottimizza Largest Contentful Paint (LCP)",
        description: `LCP è ${ps.coreWebVitals.lcp}ms, supera la soglia ottimale di 2.5s. Questo impatta negativamente il ranking e l'esperienza utente. Un LCP lento aumenta significativamente il bounce rate.`,
        priority: "alta",
        impact: priorityMap.alta.impact,
        steps: [
          "Identifica l'elemento LCP (solitamente immagine hero o video) usando Chrome DevTools > Performance > Web Vitals.",
          "Ottimizza l'immagine LCP: comprimi con TinyPNG/ImageOptim, converti in WebP o AVIF, riduci dimensioni a max 1920px larghezza.",
          "Precarica risorse critiche: aggiungi <link rel='preload' as='image' href='/hero-image.webp'> nel <head>.",
          "Riduci server response time: usa CDN (Cloudflare, CloudFront), ottimizza query database, abilita caching.",
          "Elimina render-blocking CSS/JS: inlina CSS critico, defer script non critici.",
          "Usa font-display: swap per evitare che i font blocchino il rendering.",
        ],
        evidence: `LCP: ${ps.coreWebVitals.lcp}ms (target: <2500ms) - ${((ps.coreWebVitals.lcp / 2500) * 100).toFixed(0)}% più lento del target`,
        codeExamples: [
          "<!-- Preload immagine LCP -->\n<link rel=\"preload\" as=\"image\" href=\"/hero-image.webp\" fetchpriority=\"high\">",
          "/* Font display swap */\n@font-face {\n  font-family: 'YourFont';\n  src: url('font.woff2');\n  font-display: swap;\n}",
          "<!-- Defer script non critici -->\n<script src=\"analytics.js\" defer></script>",
        ],
        resources: [
          { title: "Guida Google: Ottimizzare LCP", url: "https://web.dev/lcp/", description: "Documentazione ufficiale su come migliorare LCP" },
          { title: "Chrome DevTools Web Vitals", url: "https://developer.chrome.com/docs/devtools/performance/", description: "Come misurare LCP in tempo reale" },
          { title: "TinyPNG - Compressione Immagini", url: "https://tinypng.com/", description: "Strumento gratuito per comprimere immagini" },
        ],
        metrics: {
          current: `${ps.coreWebVitals.lcp}ms`,
          target: "<2500ms",
          unit: "millisecondi",
          improvement: `Riduzione attesa: ~${lcpImprovement}% (da ${ps.coreWebVitals.lcp}ms a <2500ms)`,
        },
        difficulty: "media",
        estimatedTime: "2-4 ore",
        category: "performance",
      });
    }
    
    if (ps.coreWebVitals.cls > 0.25) {
      const clsValue = ps.coreWebVitals.cls.toFixed(3);
      recommendations.push({
        id: uuid(),
        title: "Riduci Cumulative Layout Shift (CLS)",
        description: `CLS è ${clsValue}, supera la soglia ottimale di 0.1. Questo causa layout shift durante il caricamento, creando una pessima esperienza utente e impattando negativamente il ranking.`,
        priority: "alta",
        impact: priorityMap.alta.impact,
        steps: [
          "Aggiungi dimensioni esplicite (width/height) a TUTTE le immagini e video nel HTML.",
          "Evita inserimenti dinamici di contenuto sopra il fold (banner, popup, widget) senza riservare spazio.",
          "Usa font-display: swap per evitare FOIT (Flash of Invisible Text) che causa shift quando i font caricano.",
          "Riserva spazio per annunci e iframe usando aspect-ratio CSS o dimensioni fisse.",
          "Evita di inserire contenuti sopra elementi esistenti (es: banner sticky che sposta contenuto).",
          "Usa CSS aspect-ratio per mantenere proporzioni durante il caricamento.",
        ],
        evidence: `CLS: ${clsValue} (target: <0.1) - ${((ps.coreWebVitals.cls / 0.1) * 100).toFixed(0)}% oltre il target`,
        codeExamples: [
          "<!-- Immagine con dimensioni esplicite -->\n<img src=\"hero.jpg\" width=\"1200\" height=\"675\" alt=\"Descrizione\" loading=\"lazy\">",
          "/* Aspect ratio per mantenere proporzioni */\n.image-container {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n}",
          "/* Font display swap */\n@font-face {\n  font-family: 'CustomFont';\n  font-display: swap;\n}",
          "<!-- Riserva spazio per iframe -->\n<div style=\"width: 100%; height: 0; padding-bottom: 56.25%; position: relative;\">\n  <iframe style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\" ...></iframe>\n</div>",
        ],
        resources: [
          { title: "Guida Google: CLS", url: "https://web.dev/cls/", description: "Come misurare e migliorare CLS" },
          { title: "Layout Shift GIF Generator", url: "https://defaced.dev/tools/layout-shift-gif-generator/", description: "Visualizza i layout shift del tuo sito" },
          { title: "CSS Aspect Ratio", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio", description: "Documentazione aspect-ratio CSS" },
        ],
        metrics: {
          current: clsValue,
          target: "<0.1",
          unit: "CLS score",
          improvement: `Riduzione attesa: da ${clsValue} a <0.1 (miglioramento UX significativo)`,
        },
        difficulty: "facile",
        estimatedTime: "1-3 ore",
        category: "performance",
      });
    }
    
    if (ps.coreWebVitals.tbt > 600) {
      const tbtImprovement = Math.round(((ps.coreWebVitals.tbt - 200) / ps.coreWebVitals.tbt) * 100);
      recommendations.push({
        id: uuid(),
        title: "Riduci Total Blocking Time (TBT)",
        description: `TBT è ${ps.coreWebVitals.tbt}ms, supera la soglia ottimale di 200ms. JavaScript blocca il thread principale troppo a lungo, rendendo la pagina non interattiva. Questo impatta negativamente First Input Delay (FID) e l'esperienza utente.`,
        priority: "alta",
        impact: priorityMap.alta.impact,
        steps: [
          "Identifica script pesanti usando Chrome DevTools > Performance > Main thread.",
          "Dividi JavaScript in chunk più piccoli usando code splitting (Webpack, Vite, Parcel).",
          "Defer o async script non critici: analytics, chat widget, social media embeds.",
          "Riduci complessità JavaScript: elimina librerie non utilizzate, usa tree-shaking.",
          "Usa Web Workers per task pesanti (elaborazione dati, calcoli complessi).",
          "Ottimizza event listeners: usa debounce/throttle, rimuovi listener non necessari.",
          "Lazy load script non critici: carica solo quando necessario.",
        ],
        evidence: `TBT: ${ps.coreWebVitals.tbt}ms (target: <200ms) - ${((ps.coreWebVitals.tbt / 200) * 100).toFixed(0)}% oltre il target`,
        codeExamples: [
          "<!-- Defer script non critici -->\n<script src=\"analytics.js\" defer></script>\n<script src=\"chat-widget.js\" defer></script>",
          "// Code splitting con dynamic import\nconst HeavyComponent = lazy(() => import('./HeavyComponent'));",
          "// Web Worker per task pesanti\nconst worker = new Worker('data-processor.js');\nworker.postMessage(largeData);",
          "// Debounce event listener\nconst debouncedHandler = debounce(handleScroll, 100);\nwindow.addEventListener('scroll', debouncedHandler);",
        ],
        resources: [
          { title: "Guida Google: TBT", url: "https://web.dev/tbt/", description: "Come ridurre Total Blocking Time" },
          { title: "Web Workers API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API", description: "Documentazione Web Workers" },
          { title: "JavaScript Code Splitting", url: "https://web.dev/code-splitting-suspense/", description: "Tecniche di code splitting" },
        ],
        metrics: {
          current: `${ps.coreWebVitals.tbt}ms`,
          target: "<200ms",
          unit: "millisecondi",
          improvement: `Riduzione attesa: ~${tbtImprovement}% (da ${ps.coreWebVitals.tbt}ms a <200ms)`,
        },
        difficulty: "avanzata",
        estimatedTime: "4-8 ore",
        category: "performance",
      });
    }
    
    // Ottimizzazioni risorse
    if (ps.optimizations.renderBlockingResources > 0) {
      recommendations.push({
        id: uuid(),
        title: "Elimina render-blocking resources",
        description: `${ps.optimizations.renderBlockingResources} risorse (CSS/JS) bloccano il rendering della pagina, ritardando il First Contentful Paint (FCP) e peggiorando l'esperienza utente.`,
        priority: "media",
        impact: priorityMap.media.impact,
        steps: [
          "Identifica CSS critico (above-the-fold) e inlinalo nel <head> usando <style> inline.",
          "Precarica CSS non critico: <link rel='preload' as='style' href='non-critical.css' onload=\"this.onload=null;this.rel='stylesheet'\">.",
          "Defer JavaScript non critico: aggiungi attributo defer o async agli script.",
          "Minifica e comprimi CSS/JS: usa strumenti come Terser, UglifyJS, cssnano.",
          "Usa media queries per CSS non critici: <link rel='stylesheet' media='print' href='print.css' onload=\"this.media='all'\">.",
          "Elimina CSS non utilizzato: usa PurgeCSS o strumenti simili per rimuovere CSS inutilizzato.",
        ],
        evidence: `${ps.optimizations.renderBlockingResources} risorse render-blocking trovate (CSS/JS che bloccano il rendering)`,
        codeExamples: [
          "<!-- CSS critico inline -->\n<style>\n  /* CSS above-the-fold qui */\n  .header { ... }\n  .hero { ... }\n</style>",
          "<!-- Preload CSS non critico -->\n<link rel=\"preload\" as=\"style\" href=\"non-critical.css\" onload=\"this.onload=null;this.rel='stylesheet'\">\n<noscript><link rel=\"stylesheet\" href=\"non-critical.css\"></noscript>",
          "<!-- Defer JavaScript -->\n<script src=\"analytics.js\" defer></script>\n<script src=\"chat.js\" async></script>",
          "/* CSS con media query per non critico */\n<link rel=\"stylesheet\" href=\"print.css\" media=\"print\" onload=\"this.media='all'\">",
        ],
        resources: [
          { title: "Guida: Render-blocking Resources", url: "https://web.dev/render-blocking-resources/", description: "Come eliminare risorse render-blocking" },
          { title: "Critical CSS Tools", url: "https://github.com/addyosmani/critical", description: "Strumenti per estrarre CSS critico" },
          { title: "PurgeCSS", url: "https://purgecss.com/", description: "Rimuovi CSS non utilizzato" },
        ],
        metrics: {
          current: `${ps.optimizations.renderBlockingResources} risorse`,
          target: "0 risorse",
          improvement: `Miglioramento FCP atteso: ~${Math.min(ps.optimizations.renderBlockingResources * 100, 500)}ms`,
        },
        difficulty: "media",
        estimatedTime: "2-4 ore",
        category: "performance",
        affectedResources: [`${ps.optimizations.renderBlockingResources} file CSS/JS`],
      });
    }
    
    if (ps.optimizations.unoptimizedImages > 0) {
      const estimatedSavings = ps.optimizations.unoptimizedImages * 200; // Stima ~200KB per immagine
      recommendations.push({
        id: uuid(),
        title: "Ottimizza immagini",
        description: `${ps.optimizations.unoptimizedImages} immagini non sono ottimizzate. Immagini non compresse possono aggiungere centinaia di KB al caricamento, rallentando significativamente la pagina.`,
        priority: "media",
        impact: priorityMap.media.impact,
        steps: [
          "Comprimi tutte le immagini: usa TinyPNG, ImageOptim, o Squoosh per ridurre dimensioni del 60-80% senza perdita visibile di qualità.",
          "Converti in formati moderni: WebP (supporto 95% browser) o AVIF (migliore compressione) con fallback JPG/PNG.",
          "Usa responsive images: implementa <picture> con srcset per servire dimensioni appropriate per ogni dispositivo.",
          "Implementa lazy loading: aggiungi loading='lazy' a immagini below-the-fold.",
          "Riduci dimensioni: non servire immagini più grandi di 1920px per desktop, 800px per mobile.",
          "Usa CDN per immagini: servile da CDN ottimizzato (Cloudinary, Imgix, ImageKit).",
        ],
        evidence: `${ps.optimizations.unoptimizedImages} immagini non ottimizzate trovate (probabile risparmio: ~${Math.round(estimatedSavings / 1024)}KB)`,
        codeExamples: [
          "<!-- Responsive image con WebP -->\n<picture>\n  <source srcset=\"hero.webp\" type=\"image/webp\">\n  <source srcset=\"hero.jpg\" type=\"image/jpeg\">\n  <img src=\"hero.jpg\" alt=\"Descrizione\" loading=\"lazy\">\n</picture>",
          "<!-- Lazy loading -->\n<img src=\"image.jpg\" alt=\"Descrizione\" loading=\"lazy\" width=\"1200\" height=\"675\">",
          "<!-- Responsive srcset -->\n<img srcset=\"\n  image-400w.jpg 400w,\n  image-800w.jpg 800w,\n  image-1200w.jpg 1200w\n\" sizes=\"(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px\" src=\"image-1200w.jpg\" alt=\"Descrizione\">",
        ],
        resources: [
          { title: "TinyPNG - Compressione Immagini", url: "https://tinypng.com/", description: "Comprimi PNG e JPG online gratuitamente" },
          { title: "Squoosh - Ottimizzatore Immagini", url: "https://squoosh.app/", description: "Strumento avanzato per ottimizzazione immagini" },
          { title: "Guida: Ottimizzare Immagini", url: "https://web.dev/fast/#optimize-your-images", description: "Best practices per immagini web" },
          { title: "Cloudinary - CDN Immagini", url: "https://cloudinary.com/", description: "CDN con ottimizzazione automatica immagini" },
        ],
        metrics: {
          current: `${ps.optimizations.unoptimizedImages} immagini`,
          target: "0 immagini non ottimizzate",
          improvement: `Risparmio stimato: ~${Math.round(estimatedSavings / 1024)}KB (${Math.round((estimatedSavings / 1024) * 0.5)}s su 3G)`,
        },
        difficulty: "facile",
        estimatedTime: "2-3 ore",
        category: "performance",
        affectedResources: [`${ps.optimizations.unoptimizedImages} file immagine`],
      });
    }
    
    if (!ps.optimizations.textCompression) {
      recommendations.push({
        id: uuid(),
        title: "Abilita compressione testo",
        description: "Il server non comprime risorse testuali (CSS, JS, HTML). La compressione può ridurre le dimensioni del 70-90%, migliorando significativamente i tempi di caricamento.",
        priority: "media",
        impact: priorityMap.media.impact,
        steps: [
          "Abilita gzip o Brotli sul server web (Brotli offre ~15% migliore compressione di gzip).",
          "Verifica header Content-Encoding nella risposta usando Chrome DevTools > Network > Headers.",
          "Configura Apache: aggiungi mod_deflate o mod_brotli in .htaccess o httpd.conf.",
          "Configura Nginx: aggiungi direttive gzip o brotli in nginx.conf.",
          "Configura Cloudflare/CDN: abilita compressione automatica nel pannello di controllo.",
          "Testa la compressione: verifica che Content-Encoding: gzip o br sia presente nelle risposte.",
        ],
        evidence: "Compressione testo non rilevata (header Content-Encoding mancante o non configurato)",
        codeExamples: [
          "<!-- Apache .htaccess -->\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json\n</IfModule>",
          "# Nginx nginx.conf\nserver {\n  gzip on;\n  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n  gzip_min_length 1000;\n}",
          "<!-- Cloudflare: abilita Auto Minify e Brotli nel dashboard -->",
        ],
        resources: [
          { title: "Guida: Compressione Testo", url: "https://web.dev/text-compression/", description: "Come abilitare compressione su vari server" },
          { title: "Apache mod_deflate", url: "https://httpd.apache.org/docs/current/mod/mod_deflate.html", description: "Documentazione mod_deflate Apache" },
          { title: "Nginx gzip", url: "https://nginx.org/en/docs/http/ngx_http_gzip_module.html", description: "Configurazione gzip Nginx" },
          { title: "Brotli vs Gzip", url: "https://paulcalvano.com/2018-07-25-brotli-compression-how-much-will-it-reduce-your-content/", description: "Confronto Brotli vs Gzip" },
        ],
        metrics: {
          current: "Nessuna compressione",
          target: "gzip o Brotli abilitato",
          improvement: "Riduzione dimensioni attesa: 70-90% (es: 500KB → 50-150KB)",
        },
        difficulty: "facile",
        estimatedTime: "30 minuti - 1 ora",
        category: "performance",
      });
    }
  } else if (technical.averageLoadTimeMs > 3000) {
    // Fallback a raccomandazione generica se PageSpeed non disponibile
    recommendations.push({
      id: uuid(),
      title: "Ottimizza la velocità di caricamento",
      description:
        "I tempi medi superano i 3 secondi, soglia oltre la quale aumenta il bounce rate.",
      priority: "alta",
      impact: priorityMap.alta.impact,
      steps: [
        "Comprimi immagini e abilita formati moderni (WebP).",
        "Attiva caching lato server e CDN.",
        "Riduci script inutilizzati e carica CSS in modo asincrono.",
      ],
      evidence: `Tempo medio stimato: ${technical.averageLoadTimeMs}ms.`,
    });
  }

  // Meta tags: più specifico - mostra solo se mancano effettivamente
  const missingMetaTags = onPage.metaTagsMissing.filter(tag => {
    // Se manca solo Twitter Card, è meno critico
    return tag !== 'twitter-card';
  });
  
  if (missingMetaTags.length > 0) {
    const missingList = missingMetaTags.join(', ');
    recommendations.push({
      id: uuid(),
      title: `Completa meta tag mancanti: ${missingList}`,
      description: `Mancano ${missingMetaTags.length} meta tag essenziali: ${missingList}. Meta title e description sono essenziali per il ranking e influenzano direttamente il click-through rate (CTR) nei risultati di ricerca.`,
      priority: "alta",
      impact: priorityMap.alta.impact,
      steps: [
        "Definisci titoli unici per ogni pagina: max 60 caratteri (Google tronca a ~50-60), includi keyword principale e località.",
        "Scrivi meta description accattivanti: 120-155 caratteri, includi CTA, keyword, e valore unico della pagina.",
        "Evita duplicati: ogni pagina deve avere title e description unici.",
        "Ottimizza per intent: usa linguaggio che risponde alle query degli utenti.",
        "Verifica anteprima: usa SERP Snippet Tool o Google Search Console per vedere come appariranno nei risultati.",
        "Aggiungi structured data: usa JSON-LD per fornire contesto aggiuntivo a Google.",
      ],
      evidence: `Meta tag mancanti: ${missingList} (rilevati durante la scansione della homepage)`,
      codeExamples: [
        "<!-- Meta title ottimizzato -->\n<title>Ristorante Pizzeria Milano | Menu e Prenotazioni Online</title>",
        "<!-- Meta description ottimizzata -->\n<meta name=\"description\" content=\"Pizzeria tradizionale a Milano. Menu completo, prenotazioni online, consegna a domicilio. Scopri le nostre pizze artigianali!\">",
        "<!-- Open Graph per social -->\n<meta property=\"og:title\" content=\"Ristorante Pizzeria Milano\">\n<meta property=\"og:description\" content=\"Pizzeria tradizionale a Milano...\">\n<meta property=\"og:image\" content=\"https://example.com/og-image.jpg\">",
      ],
      resources: [
        { title: "SERP Snippet Tool", url: "https://www.serpsnippetoptimizer.com/", description: "Anteprima come appariranno nei risultati Google" },
        { title: "Guida Google: Meta Tags", url: "https://developers.google.com/search/docs/appearance/snippet", description: "Best practices per title e description" },
        { title: "Title Tag Checker", url: "https://www.seoreviewtools.com/title-tag-optimization/", description: "Analizza e ottimizza i tuoi title tag" },
      ],
      metrics: {
        current: `Mancano: ${missingList}`,
        target: "Tutti i meta tag presenti",
        improvement: "Miglioramento CTR atteso: +15-30% nei risultati di ricerca",
      },
      difficulty: "facile",
      estimatedTime: "1-2 ore",
      category: "seo",
      affectedResources: [`Meta tag: ${missingList}`],
    });
  }

  // Immagini: mostra solo se ci sono effettivamente immagini senza alt
  if (onPage.imagesWithoutAlt > 0) {
    const severity = onPage.imagesWithoutAlt > 10 ? 'molte' : onPage.imagesWithoutAlt > 5 ? 'diverse' : 'alcune';
    recommendations.push({
      id: uuid(),
      title: `Aggiungi alt text a ${onPage.imagesWithoutAlt} immagine${onPage.imagesWithoutAlt > 1 ? 'i' : ''} senza descrizione`,
      description: `${onPage.imagesWithoutAlt} ${severity} immagini non hanno testo alternativo descrittivo. L'alt text è essenziale per accessibilità, SEO (Google Images) e migliora l'esperienza utente quando le immagini non caricano.`,
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Elenca tutte le immagini senza alt: usa Chrome DevTools o strumenti SEO per identificarle.",
        "Scrivi alt text descrittivi: 5-15 parole, includi keyword rilevanti, descrivi cosa mostra l'immagine.",
        "Evita keyword stuffing: l'alt deve essere naturale e descrittivo, non solo una lista di keyword.",
        "Per immagini decorative: usa alt=\"\" (vuoto) invece di omettere l'attributo.",
        "Aggiorna CMS o codice: inserisci l'attributo alt in ogni tag <img>.",
        "Testa con screen reader: verifica che gli alt text siano utili per utenti con disabilità visive.",
      ],
      evidence: `${onPage.imagesWithoutAlt} immagini senza alt text trovate durante la scansione`,
      codeExamples: [
        "<!-- Alt text descrittivo e keyword-rich -->\n<img src=\"pizza-margherita.jpg\" alt=\"Pizza Margherita tradizionale napoletana con pomodoro, mozzarella e basilico fresco\" width=\"800\" height=\"600\">",
        "<!-- Immagine decorativa (alt vuoto) -->\n<img src=\"decorative-divider.svg\" alt=\"\" role=\"presentation\">",
        "<!-- Immagine con contesto -->\n<img src=\"ristorante-esterno.jpg\" alt=\"Esterno del ristorante Pizzeria Milano in via Roma, facciata tradizionale italiana\">",
      ],
      resources: [
        { title: "Guida: Alt Text per SEO", url: "https://moz.com/learn/seo/alt-text", description: "Come scrivere alt text efficaci per SEO" },
        { title: "WebAIM: Alternative Text", url: "https://webaim.org/techniques/alttext/", description: "Best practices per accessibilità" },
        { title: "Google Images SEO", url: "https://developers.google.com/search/docs/appearance/google-images", description: "Come ottimizzare immagini per Google Images" },
      ],
      metrics: {
        current: `${onPage.imagesWithoutAlt} immagini senza alt`,
        target: "0 immagini",
        improvement: "Miglioramento SEO Images atteso: +20-40% traffico da Google Images",
      },
      difficulty: "facile",
      estimatedTime: "1-2 ore",
      category: "seo",
      affectedResources: [`${onPage.imagesWithoutAlt} immagini`],
    });
  }

  // NAP: più specifico - mostra cosa manca esattamente
  if (!local.napConsistency) {
    const missingNap = [];
    if (!local.napDetails.name) missingNap.push('Nome');
    if (!local.napDetails.address) missingNap.push('Indirizzo');
    if (!local.napDetails.phone) missingNap.push('Telefono');
    
    const napTitle = missingNap.length === 3 
      ? "Aggiungi dati NAP completi (Name, Address, Phone)"
      : `Completa dati NAP mancanti: ${missingNap.join(', ')}`;
    
    recommendations.push({
      id: uuid(),
      title: napTitle,
      description:
        `${missingNap.length === 3 ? 'I dati NAP (Name, Address, Phone) non sono presenti' : `Mancano i seguenti dati NAP: ${missingNap.join(', ')}`} nella homepage. La coerenza NAP è critica per Local SEO: Google verifica che i dati siano identici su sito web, Google Business Profile, e directory locali.`,
      priority: "alta",
      impact: priorityMap.alta.impact,
      steps: [
        "Mostra chiaramente NAP nel footer della homepage: nome azienda completo, indirizzo completo (via, numero, CAP, città), telefono con prefisso internazionale se necessario.",
        "Verifica coerenza: assicurati che NAP sia IDENTICO (stesso formato, stesse abbreviazioni) su Google Business Profile, Facebook, Yelp, e altre directory.",
        "Inserisci microdati schema.org/LocalBusiness: aggiungi JSON-LD con tutti i campi NAP nel formato strutturato.",
        "Aggiungi NAP anche nella pagina Contatti: crea una pagina dedicata con mappa e informazioni complete.",
        "Usa formato standardizzato: sempre stesso formato per indirizzo (es: sempre 'Via' o sempre abbreviazione 'V.')",
        "Verifica con strumenti: usa Local SEO Checker per trovare inconsistenze su directory.",
      ],
      evidence: `Dati NAP mancanti: ${missingNap.join(', ')} (rilevati durante la scansione della homepage)`,
      codeExamples: [
        "<!-- NAP nel footer -->\n<footer>\n  <p><strong>Pizzeria Milano</strong></p>\n  <p>Via Roma 123, 20121 Milano (MI)</p>\n  <p>Tel: +39 02 1234 5678</p>\n</footer>",
        "<!-- Schema LocalBusiness JSON-LD -->\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"LocalBusiness\",\n  \"name\": \"Pizzeria Milano\",\n  \"address\": {\n    \"@type\": \"PostalAddress\",\n    \"streetAddress\": \"Via Roma 123\",\n    \"addressLocality\": \"Milano\",\n    \"postalCode\": \"20121\",\n    \"addressRegion\": \"MI\",\n    \"addressCountry\": \"IT\"\n  },\n  \"telephone\": \"+390212345678\"\n}\n</script>",
        "<!-- NAP con microdata -->\n<div itemscope itemtype=\"https://schema.org/LocalBusiness\">\n  <span itemprop=\"name\">Pizzeria Milano</span><br>\n  <div itemprop=\"address\" itemscope itemtype=\"https://schema.org/PostalAddress\">\n    <span itemprop=\"streetAddress\">Via Roma 123</span><br>\n    <span itemprop=\"postalCode\">20121</span> <span itemprop=\"addressLocality\">Milano</span>\n  </div>\n  <span itemprop=\"telephone\">+39 02 1234 5678</span>\n</div>",
      ],
      resources: [
        { title: "Schema.org LocalBusiness", url: "https://schema.org/LocalBusiness", description: "Documentazione ufficiale schema LocalBusiness" },
        { title: "Google Business Profile", url: "https://business.google.com/", description: "Gestisci il tuo profilo Google Business" },
        { title: "Local SEO Checker", url: "https://www.brightlocal.com/local-seo-tools/", description: "Strumenti per verificare coerenza NAP" },
        { title: "Guida: NAP Consistency", url: "https://moz.com/learn/local/nap-consistency", description: "Importanza della coerenza NAP" },
      ],
      metrics: {
        current: `Mancano: ${missingNap.join(', ')}`,
        target: "Nome, Indirizzo e Telefono presenti",
        improvement: "Miglioramento ranking locale atteso: +25-40% visibilità ricerca locale",
      },
      difficulty: "facile",
      estimatedTime: "1-2 ore",
      category: "local",
    });
  }

  if (offPage.domainAuthorityScore < 30) {
    recommendations.push({
      id: uuid(),
      title: "Rafforza l'autorità del dominio",
      description:
        `L'autorità stimata è ${offPage.domainAuthorityScore}/100, sotto la media dei competitor locali. L'autorità del dominio (Domain Authority) è un fattore importante per il ranking, basato su qualità e quantità di backlink.`,
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Crea contenuti di qualità: pubblica guide approfondite, case study, risorse utili che altri vorranno linkare.",
        "Attiva collaborazione con directory locali: iscriviti a directory locali rilevanti (Yelp, TripAdvisor per ristoranti, directory business locali).",
        "Outreach a blog locali: contatta blogger e giornalisti locali per guest post o menzioni.",
        "Partecipa a eventi locali: sponsorizza eventi, partecipa a fiere, ottieni menzioni e link da organizzatori.",
        "Crea partnership: collabora con altre aziende locali per link reciproci (se rilevanti).",
        "Monitora backlink: usa Google Search Console > Links e strumenti come Ahrefs, SEMrush per tracciare nuovi link.",
        "Evita link spam: non comprare link, evita directory di bassa qualità, focus su link naturali e rilevanti.",
      ],
      evidence: `Domain Authority stimata: ${offPage.domainAuthorityScore}/100 (target: >30)`,
      resources: [
        { title: "Google Search Console - Links", url: "https://search.google.com/search-console", description: "Monitora i link al tuo sito" },
        { title: "Moz: Link Building", url: "https://moz.com/learn/seo/link-building", description: "Guida completa al link building" },
        { title: "Ahrefs Backlink Checker", url: "https://ahrefs.com/backlink-checker", description: "Analizza i backlink del tuo sito" },
        { title: "Directory Locali Italia", url: "https://www.paginegialle.it/", description: "Iscriviti a directory locali rilevanti" },
      ],
      metrics: {
        current: `${offPage.domainAuthorityScore}/100`,
        target: ">30/100",
        improvement: `Miglioramento atteso: +${30 - offPage.domainAuthorityScore} punti DA in 6-12 mesi con strategia costante`,
      },
      difficulty: "avanzata",
      estimatedTime: "Ongoing (strategia a lungo termine)",
      category: "offPage",
    });
  }

  if (!local.hasLocalPages) {
    recommendations.push({
      id: uuid(),
      title: "Crea pagine dedicate alle zone servite",
      description:
        "Non risultano landing ottimizzate per le principali località target. Le pagine locali aumentano la visibilità per ricerche geografiche specifiche e migliorano il ranking locale.",
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Mappa le città/province servite: identifica le 5-10 località principali dove operi.",
        "Crea una pagina per ogni località: es. 'Servizi a Milano', 'Servizi a Roma', etc.",
        "Ottimizza ogni pagina: includi keyword locali (servizio + città), NAP specifico per quella zona, contenuti unici.",
        "Inserisci contenuti locali: casi studio locali, testimonianze di clienti della zona, eventi/partnership locali.",
        "Aggiungi mappa Google Maps: mostra la posizione o area di servizio per quella località.",
        "Linka internamente: aggiungi link nel menu, footer, o pagina 'Dove operiamo'.",
        "Crea contenuti unici: evita duplicati, ogni pagina deve avere contenuto originale e rilevante.",
      ],
      evidence: "Pagine locali non trovate durante la scansione",
      codeExamples: [
        "<!-- Esempio struttura pagina locale -->\n<h1>Servizi di [Servizio] a [Città]</h1>\n<p>Siamo specializzati in [servizio] per aziende e privati a [Città] e dintorni...</p>\n<div itemscope itemtype=\"https://schema.org/LocalBusiness\">\n  <span itemprop=\"areaServed\">[Città]</span>\n</div>",
        "<!-- Link interno da homepage -->\n<a href=\"/servizi-milano\">Servizi a Milano</a>\n<a href=\"/servizi-roma\">Servizi a Roma</a>",
      ],
      resources: [
        { title: "Guida: Local Landing Pages", url: "https://moz.com/learn/local/local-landing-pages", description: "Come creare pagine locali efficaci" },
        { title: "Google My Business", url: "https://business.google.com/", description: "Collega le pagine locali al profilo Google Business" },
        { title: "Local SEO Checklist", url: "https://www.brightlocal.com/local-seo-checklist/", description: "Checklist completa per SEO locale" },
      ],
      metrics: {
        current: "0 pagine locali",
        target: "5-10 pagine locali",
        improvement: "Miglioramento traffico locale atteso: +30-50% ricerche geografiche",
      },
      difficulty: "media",
      estimatedTime: "4-8 ore",
      category: "local",
    });
  }

  if (!technical.hasSitemap || !technical.hasRobots) {
    recommendations.push({
      id: uuid(),
      title: "Configura sitemap.xml e robots.txt",
      description:
        "Gli asset fondamentali per l'indicizzazione non sono raggiungibili. Sitemap.xml aiuta Google a trovare e indicizzare tutte le pagine, mentre robots.txt controlla l'accesso dei crawler.",
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Genera sitemap.xml: usa plugin CMS (Yoast SEO, Rank Math per WordPress) o strumenti online (XML Sitemap Generator).",
        "Pubblica sitemap in root: assicurati che sia accessibile a https://tuosito.com/sitemap.xml.",
        "Crea robots.txt: includi User-agent, Allow/Disallow, e Sitemap location.",
        "Invia sitemap in Google Search Console: vai a Sitemaps e aggiungi l'URL della sitemap.",
        "Verifica accessibilità: testa che sitemap.xml e robots.txt siano raggiungibili e validi.",
        "Aggiorna sitemap regolarmente: quando aggiungi nuove pagine, rigenera la sitemap.",
      ],
      evidence: technical.hasSitemap ? "robots.txt mancante" : technical.hasRobots ? "sitemap.xml mancante" : "Sitemap e robots mancanti",
      codeExamples: [
        "<!-- robots.txt esempio -->\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /wp-admin/\nDisallow: /wp-includes/\nSitemap: https://example.com/sitemap.xml",
        "<!-- Sitemap.xml struttura base -->\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2024-01-15</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>",
      ],
      resources: [
        { title: "XML Sitemap Generator", url: "https://www.xml-sitemaps.com/", description: "Genera sitemap automaticamente" },
        { title: "Google Search Console", url: "https://search.google.com/search-console", description: "Invia e monitora la tua sitemap" },
        { title: "Robots.txt Tester", url: "https://www.google.com/webmasters/tools/robots-testing-tool", description: "Testa il tuo robots.txt" },
        { title: "Guida: Sitemap", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview", description: "Documentazione ufficiale Google" },
      ],
      metrics: {
        current: technical.hasSitemap ? "robots.txt mancante" : technical.hasRobots ? "sitemap.xml mancante" : "Entrambi mancanti",
        target: "Sitemap.xml e robots.txt presenti",
        improvement: "Miglioramento indicizzazione atteso: +15-25% pagine indicizzate più velocemente",
      },
      difficulty: "facile",
      estimatedTime: "30 minuti",
      category: "technical",
    });
  }

  if (!local.hasLocalSchema) {
    recommendations.push({
      id: uuid(),
      title: "Implementa schema LocalBusiness",
      description:
        "Manca il markup strutturato per attività locali. Lo schema LocalBusiness aiuta Google a comprendere meglio la tua attività e può generare rich results (stelle, orari, indirizzo) nei risultati di ricerca.",
      priority: "bassa",
      impact: priorityMap.bassa.impact,
      steps: [
        "Aggiungi script JSON-LD nel <head> della homepage con @type LocalBusiness.",
        "Compila campi essenziali: name, address (con geo coordinate), telephone, url, priceRange.",
        "Aggiungi campi opzionali: openingHours, image, aggregateRating, servesCuisine (per ristoranti), areaServed.",
        "Includi sameAs: linka profili social (Facebook, Instagram, LinkedIn) per aumentare trust.",
        "Testa il markup: usa Google Rich Results Test o Schema.org Validator per verificare che sia corretto.",
        "Monitora in Search Console: verifica che Google riconosca lo schema dopo qualche giorno.",
      ],
      evidence: "Schema LocalBusiness non trovato nella homepage",
      codeExamples: [
        "<!-- Schema LocalBusiness completo -->\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Restaurant\",\n  \"name\": \"Pizzeria Milano\",\n  \"image\": \"https://example.com/logo.jpg\",\n  \"@id\": \"https://example.com\",\n  \"url\": \"https://example.com\",\n  \"telephone\": \"+390212345678\",\n  \"priceRange\": \"€€\",\n  \"address\": {\n    \"@type\": \"PostalAddress\",\n    \"streetAddress\": \"Via Roma 123\",\n    \"addressLocality\": \"Milano\",\n    \"postalCode\": \"20121\",\n    \"addressRegion\": \"Lombardia\",\n    \"addressCountry\": \"IT\"\n  },\n  \"geo\": {\n    \"@type\": \"GeoCoordinates\",\n    \"latitude\": 45.4642,\n    \"longitude\": 9.1900\n  },\n  \"openingHoursSpecification\": [\n    {\n      \"@type\": \"OpeningHoursSpecification\",\n      \"dayOfWeek\": [\"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\"],\n      \"opens\": \"12:00\",\n      \"closes\": \"23:00\"\n    }\n  ],\n  \"sameAs\": [\n    \"https://www.facebook.com/pizzeriamilano\",\n    \"https://www.instagram.com/pizzeriamilano\"\n  ]\n}\n</script>",
      ],
      resources: [
        { title: "Schema.org LocalBusiness", url: "https://schema.org/LocalBusiness", description: "Documentazione completa schema LocalBusiness" },
        { title: "Google Rich Results Test", url: "https://search.google.com/test/rich-results", description: "Testa il tuo schema markup" },
        { title: "Schema Markup Generator", url: "https://technicalseo.com/tools/schema-markup-generator/", description: "Genera schema markup automaticamente" },
        { title: "Guida: Structured Data", url: "https://developers.google.com/search/docs/appearance/structured-data", description: "Come usare structured data per SEO" },
      ],
      metrics: {
        current: "Nessuno schema",
        target: "Schema LocalBusiness completo",
        improvement: "Miglioramento CTR atteso: +10-20% (rich results con stelle/orari)",
      },
      difficulty: "facile",
      estimatedTime: "30 minuti - 1 ora",
      category: "local",
    });
  }

  // ========== RACCOMANDAZIONI AEO/RAO ==========
  
  // 1. Struttura domanda-risposta - più specifico
  if (!aeo.hasQaStructure && aeo.qaSections === 0) {
    const questionCount = (aeo.relatedQuestions || 0);
    const hasQuestions = questionCount > 0;
    
    recommendations.push({
      id: uuid(),
      title: hasQuestions 
        ? `Struttura le ${questionCount} domande trovate in formato Q&A per AEO`
        : "Implementa struttura domanda-risposta per AEO",
      description:
        hasQuestions
          ? `Il contenuto contiene ${questionCount} domande ma non sono strutturate in formato Q&A. Le AI e i motori di risposta privilegiano contenuti strutturati in formato Q&A. Strutturare queste domande migliora la probabilità di essere citati da ChatGPT, Claude, Perplexity e Google AI Overview.`
          : "Le AI e i motori di risposta privilegiano contenuti strutturati in formato Q&A. Aggiungere sezioni domanda-risposta migliora la probabilità di essere citati da ChatGPT, Claude, Perplexity e Google AI Overview.",
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Crea una sezione FAQ con domande comuni del tuo settore.",
        "Usa formato chiaro: Domanda in grassetto, risposta in paragrafo breve (2-3 frasi).",
        "Implementa schema FAQPage con JSON-LD per facilitare l'estrazione da parte delle AI.",
        "Includi domande che iniziano con 'Come', 'Perché', 'Quando', 'Dove', 'Cosa'.",
        "Posiziona le FAQ in punti strategici: homepage, pagine prodotto/servizio, footer.",
      ],
      evidence: hasQuestions 
        ? `${questionCount} domande trovate ma non strutturate in formato Q&A`
        : "Nessuna struttura Q&A rilevata nel contenuto (0 sezioni Q&A trovate)",
      codeExamples: [
        "<!-- Esempio struttura Q&A -->\n<div class=\"faq-section\">\n  <h3><strong>Come funziona il servizio?</strong></h3>\n  <p>Il servizio funziona in tre semplici passaggi: contatto, consulenza e implementazione.</p>\n</div>",
        "<!-- Schema FAQPage JSON-LD -->\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [{\n    \"@type\": \"Question\",\n    \"name\": \"Come funziona il servizio?\",\n    \"acceptedAnswer\": {\n      \"@type\": \"Answer\",\n      \"text\": \"Il servizio funziona in tre passaggi...\"\n    }\n  }]\n}\n</script>",
      ],
      resources: [
        { title: "Schema.org FAQPage", url: "https://schema.org/FAQPage", description: "Documentazione ufficiale schema FAQPage" },
        { title: "Google: Structured Data Testing", url: "https://search.google.com/test/rich-results", description: "Testa il tuo schema FAQ" },
      ],
      metrics: {
        current: "0 sezioni Q&A",
        target: "3+ sezioni Q&A",
        improvement: "Aumento citazioni AI atteso: +30-50%",
      },
      difficulty: "facile",
      estimatedTime: "2-4 ore",
      category: "aeo",
    });
  }

  // 2. Schema markup mancante - più specifico
  if (!aeo.hasFaqSchema && !aeo.hasHowToSchema && !aeo.hasArticleSchema) {
    const existingSchemas = aeo.structuredDataTypes.length > 0 
      ? `Schema presenti: ${aeo.structuredDataTypes.slice(0, 3).join(', ')}${aeo.structuredDataTypes.length > 3 ? '...' : ''}`
      : 'Nessuno schema strutturato trovato';
    
    recommendations.push({
      id: uuid(),
      title: "Aggiungi schema markup per AEO (FAQ, HowTo, Article)",
      description:
        `${existingSchemas}. I dati strutturati Schema.org aiutano le AI a comprendere e citare meglio i tuoi contenuti. FAQPage, HowTo e Article sono particolarmente efficaci per l'Answer Engine Optimization.`,
      priority: "alta",
      impact: priorityMap.alta.impact,
      steps: [
        "Identifica contenuti adatti: FAQ, guide passo-passo, articoli informativi.",
        "Implementa schema FAQPage per domande frequenti.",
        "Usa schema HowTo per guide e tutorial.",
        "Aggiungi schema Article per blog post e contenuti editoriali.",
        "Testa con Google Rich Results Test per verificare la validità.",
      ],
      evidence: `Nessuno schema FAQ/HowTo/Article trovato. ${existingSchemas}`,
      codeExamples: [
        "<!-- Schema HowTo -->\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"HowTo\",\n  \"name\": \"Come ottimizzare il SEO\",\n  \"step\": [{\n    \"@type\": \"HowToStep\",\n    \"text\": \"Passo 1: Analizza le keyword\"\n  }]\n}\n</script>",
      ],
      resources: [
        { title: "Schema.org Types", url: "https://schema.org/docs/full.html", description: "Tutti i tipi di schema disponibili" },
        { title: "Google: Structured Data", url: "https://developers.google.com/search/docs/appearance/structured-data", description: "Guida ufficiale Google" },
      ],
      metrics: {
        current: "0 schemi FAQ/HowTo/Article",
        target: "1+ schema",
        improvement: "Miglioramento estrazione AI: +40-60%",
      },
      difficulty: "media",
      estimatedTime: "3-5 ore",
      category: "aeo",
    });
  }

  // 3. Contenuti non citabili - più specifico
  if (!aeo.hasStatistics && !aeo.hasSources && aeo.snippetReadyContent < 3) {
    const missing = [];
    if (!aeo.hasStatistics) missing.push('statistiche');
    if (!aeo.hasSources) missing.push('fonti');
    if (aeo.snippetReadyContent < 3) missing.push(`paragrafi snippet-ready (${aeo.snippetReadyContent}/3)`);
    
    recommendations.push({
      id: uuid(),
      title: `Migliora citabilità contenuti: aggiungi ${missing.join(', ')}`,
      description:
        `Il contenuto manca di: ${missing.join(', ')}. Le AI privilegiano contenuti con statistiche, fonti verificabili e paragrafi brevi e informativi (snippet-ready). Questo aumenta la probabilità di essere citati nelle risposte.`,
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Aggiungi statistiche e dati numerici: percentuali, cifre, date.",
        "Cita fonti autorevoli: 'Secondo uno studio di...', 'Fonte: ...'.",
        "Riscrivi paragrafi lunghi in paragrafi brevi (2-3 frasi, max 300 caratteri).",
        "Usa liste puntate per informazioni facilmente estraibili.",
        "Includi tabelle per dati strutturati (prezzi, confronti, specifiche).",
      ],
      evidence: `Mancano: ${missing.join(', ')}. Paragrafi snippet-ready attuali: ${aeo.snippetReadyContent}/3 (target: 3+)`,
      codeExamples: [
        "<!-- Paragrafo snippet-ready -->\n<p>Secondo uno studio del 2024, il 73% degli utenti cerca informazioni locali su mobile. Questo dato evidenzia l'importanza della SEO locale per le PMI italiane.</p>",
        "<!-- Lista estraibile -->\n<ul>\n  <li>Ottimizzazione mobile: +40% conversioni</li>\n  <li>Schema markup: +25% visibilità</li>\n  <li>Contenuti locali: +60% traffico locale</li>\n</ul>",
      ],
      resources: [
        { title: "Content for AI: Best Practices", url: "https://www.searchenginejournal.com/answer-engine-optimization/", description: "Guida AEO per contenuti citabili" },
      ],
      metrics: {
        current: `${aeo.snippetReadyContent} paragrafi snippet-ready`,
        target: "3+ paragrafi",
        improvement: "Aumento citazioni atteso: +25-40%",
      },
      difficulty: "facile",
      estimatedTime: "2-3 ore",
      category: "aeo",
    });
  }

  // 4. Ottimizzazione semantica - più specifico
  if (aeo.topicDepth < 10 || aeo.internalLinks < 5) {
    const issues = [];
    if (aeo.topicDepth < 10) issues.push(`topic depth basso (${aeo.topicDepth}/10)`);
    if (aeo.internalLinks < 5) issues.push(`link interni insufficienti (${aeo.internalLinks}/5)`);
    
    recommendations.push({
      id: uuid(),
      title: `Approfondisci contenuto: ${issues.join(', ')}`,
      description:
        `Il contenuto ha ${issues.join(' e ')}. Le AI apprezzano contenuti approfonditi che coprono un argomento in modo completo. Crea topic clusters collegando concetti correlati con link interni.`,
      priority: "media",
      impact: priorityMap.media.impact,
      steps: [
        "Espandi i contenuti: aggiungi più paragrafi dedicati all'argomento principale.",
        "Crea link interni a pagine correlate (almeno 5-10 per pagina).",
        "Usa sinonimi e variazioni naturali delle keyword.",
        "Rispondi a domande correlate (People Also Ask style).",
        "Crea una struttura a hub: pagina principale + pagine correlate.",
      ],
      evidence: `Topic depth: ${aeo.topicDepth}/10 (target: 10+), Link interni: ${aeo.internalLinks}/5 (target: 5+)`,
      resources: [
        { title: "Topic Clusters Strategy", url: "https://www.hubspot.com/topic-clusters", description: "Come creare topic clusters efficaci" },
      ],
      metrics: {
        current: `Topic depth: ${aeo.topicDepth}, Link interni: ${aeo.internalLinks}`,
        target: "Topic depth: 15+, Link interni: 10+",
        improvement: "Miglioramento ranking semantico: +20-30%",
      },
      difficulty: "media",
      estimatedTime: "4-8 ore",
      category: "aeo",
    });
  }

  // 5. Formato e leggibilità - più specifico
  if (aeo.averageSentenceLength > 20 || aeo.averageParagraphLength > 4 || aeo.boldKeywords < 3) {
    const issues = [];
    if (aeo.averageSentenceLength > 20) issues.push(`frasi troppo lunghe (${aeo.averageSentenceLength} parole, target: <20)`);
    if (aeo.averageParagraphLength > 4) issues.push(`paragrafi troppo lunghi (${aeo.averageParagraphLength} frasi, target: 2-3)`);
    if (aeo.boldKeywords < 3) issues.push(`poche keyword evidenziate (${aeo.boldKeywords}/3)`);
    
    recommendations.push({
      id: uuid(),
      title: `Ottimizza leggibilità: ${issues.join(', ')}`,
      description:
        `Il contenuto ha problemi di leggibilità: ${issues.join('; ')}. Le AI preferiscono contenuti con frasi brevi, paragrafi corti e concetti chiave evidenziati. Questo facilita l'estrazione e la sintesi delle informazioni.`,
      priority: "bassa",
      impact: priorityMap.bassa.impact,
      steps: [
        "Riduci la lunghezza media delle frasi a <20 parole.",
        "Mantieni paragrafi di 2-3 frasi massimo.",
        "Evidenzia concetti chiave in grassetto (almeno 3-5 per pagina).",
        "Usa elenchi puntati per liste di elementi.",
        "Spezza paragrafi lunghi in paragrafi più corti.",
      ],
      evidence: `Lunghezza media frasi: ${aeo.averageSentenceLength} parole (target: <20), Paragrafi: ${aeo.averageParagraphLength} frasi (target: 2-3), Keyword in grassetto: ${aeo.boldKeywords}`,
      metrics: {
        current: `Frasi: ${aeo.averageSentenceLength} parole, Paragrafi: ${aeo.averageParagraphLength} frasi`,
        target: "Frasi: <20 parole, Paragrafi: 2-3 frasi",
        improvement: "Miglioramento leggibilità AI: +15-25%",
      },
      difficulty: "facile",
      estimatedTime: "1-2 ore",
      category: "aeo",
    });
  }

  return recommendations;
};

