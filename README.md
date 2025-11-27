# 🚀 CtrlSEOCheck - SEO Audit Tool Completo per PMI Locali

> **FIRST-MOVER**: Include analisi AEO/RAO (Answer Engine Optimization) per ottimizzare contenuti per AI e motori di risposta (ChatGPT, Claude, Perplexity, Google AI Overview)

Tool professionale per analisi SEO automatica di siti web di PMI italiane, con integrazione PageSpeed Insights API (mobile + desktop) e analisi AEO/RAO esclusiva. Dashboard interattiva, report PDF brandizzabile e sistema di scoring avanzato con raccomandazioni dettagliate.

## ✨ Caratteristiche Principali

### 🔧 Analisi SEO Completa
- **Technical SEO**: SSL, velocità, mobile-friendliness, sitemap, robots.txt
- **On-Page SEO**: Meta tags, heading structure, immagini, contenuti
- **Local SEO**: NAP consistency, schema markup locale, menzioni località (ottimizzato per PMI italiane)
- **Off-Page SEO**: Backlinks stimati, directory listings, domain authority
- **Analisi Competitor**: Confronto comparativo con fino a 3 competitor

### ⚡ PageSpeed Insights Integration
- **Metriche reali Google API**: Performance, Accessibility, Best Practices, SEO
- **Core Web Vitals**: LCP, CLS, TBT, FCP per mobile e desktop
- **Analisi separata**: Metriche diverse per dispositivi mobili e computer (come PageSpeed Insights ufficiale)

### 🤖 AEO/RAO - Answer Engine Optimization (FIRST-MOVER)
- **Struttura Q&A**: Analisi formato domanda-risposta per AI
- **Schema Markup AEO**: FAQ, HowTo, Article per motori di risposta
- **Contenuti Citabili**: Statistiche, fonti, paragrafi snippet-ready
- **Ottimizzazione Semantica**: Topic depth, link interni, domande correlate
- **Formato e Leggibilità**: Analisi lunghezza frasi, paragrafi, keyword evidenziate
- **Autorevolezza**: Valutazione contenuti per citazioni AI

### 📊 Dashboard e Report
- **Sistema di Scoring**: Punteggio 0-100 con breakdown per categoria
- **Raccomandazioni Dettagliate**: Suggerimenti prioritizzati con:
  - Esempi di codice HTML/CSS/JS
  - Link a risorse utili
  - Metriche specifiche (attuale vs target)
  - Stima tempo implementazione e difficoltà
- **Report PDF**: Export professionale brandizzato Ctrl Studio
- **Storico Analisi**: Salvataggio e confronto evolutivo
- **Quick Wins**: Sezione dedicata per miglioramenti rapidi

## 🛠️ Stack Tecnologico

- **Frontend**: React 18+ + TypeScript + Tailwind CSS + Recharts + jsPDF
- **Backend**: Node.js + Express + TypeScript + Cheerio + SQLite
- **API**: Google PageSpeed Insights API v5
- **Build Tools**: Vite, Nodemon, TypeScript

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- (Opzionale) Google Cloud API Key per PageSpeed Insights ([Guida setup](./backend/SETUP_PAGESPEED.md))

## 🛠️ Installazione

### Backend

```bash
cd backend
npm install
npm run build
```

### Frontend

```bash
cd frontend
npm install
```

## ⚙️ Configurazione PageSpeed Insights (Opzionale ma Consigliato)

Per metriche performance avanzate e Core Web Vitals:

1. Segui la guida in `backend/SETUP_PAGESPEED.md`
2. Crea un file `.env` in `backend/`:
```bash
PAGESPEED_API_KEY=your_api_key_here
```

**Senza API Key**: Il sistema funziona comunque con analisi base, ma le metriche performance saranno meno accurate.

## 🚀 Avvio

### Sviluppo

**Terminale 1 - Backend:**
```bash
cd backend
npm run dev
```
Il backend sarà disponibile su `http://localhost:3001`

**Terminale 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Il frontend sarà disponibile su `http://localhost:5173` (o porta Vite di default)

### Produzione

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Struttura del Progetto

```
seo-audit-app/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── pagespeedService.ts  # ✨ Nuovo: Integrazione PageSpeed
│   │   │   ├── htmlAnalyzer.ts
│   │   │   ├── analysisService.ts
│   │   │   └── ...
│   │   ├── db/
│   │   ├── utils/
│   │   ├── types.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── SETUP_PAGESPEED.md  # ✨ Nuovo: Guida setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   │   └── ctrl-studio-logo.svg
│   └── package.json
│
├── ROBUSTNESS.md  # Analisi robustezza vs PageSpeed
└── README.md
```

## 🎯 Utilizzo

1. **Avvia l'applicazione** (backend + frontend)
2. **Inserisci l'URL** del sito da analizzare
3. **Seleziona settore business** e **località target**
4. **Opzionale**: Aggiungi fino a 3 competitor per confronto
5. **Clicca "Avvia Analisi"** e attendi il completamento
6. **Visualizza i risultati**:
   - Score generale e breakdown per categoria
   - **Core Web Vitals** (se PageSpeed configurato)
   - Lista problemi trovati con priorità
   - Quick wins (5 azioni più impattanti)
   - Dettagli tecnici per ogni area
7. **Genera PDF** per condividere il report

## 🔍 Cosa Analizza

### Technical SEO (25 punti)
- Certificato SSL e scadenza
- **Velocità di caricamento (PageSpeed Insights se configurato)**
- **Core Web Vitals: LCP, CLS, TBT, FCP**
- Mobile-friendliness
- Presenza sitemap.xml
- Presenza robots.txt
- Link rotti
- **Ottimizzazioni risorse (render-blocking, compressione, immagini)**

### On-Page SEO (25 punti)
- Meta title e description
- Heading structure (H1, H2, H3)
- Immagini senza alt text
- Open Graph e Twitter Cards
- Canonical tags
- Schema markup

### Local SEO (20 punti)
- Dati NAP (Name, Address, Phone)
- Consistenza NAP
- Schema markup locale (LocalBusiness)
- Menzioni località nel contenuto
- Pagine dedicate alle località
- Google Business Profile

### Off-Page SEO (10 punti)

### AEO/RAO - Answer Engine Optimization (20 punti) - FIRST-MOVER
- Struttura domanda-risposta (Q&A)
- Schema markup per AI (FAQ, HowTo, Article)
- Contenuti citabili (statistiche, fonti, snippet-ready)
- Ottimizzazione semantica (topic depth, link interni, domande correlate)
- Formato e leggibilità (lunghezza frasi, paragrafi, keyword evidenziate)
- Autorevolezza (lunghezza contenuto, freshness, struttura heading)
- Backlinks stimati
- Directory listings
- Domain Authority

## 📊 Sistema di Scoring

Il punteggio totale (0-100) è calcolato come:
- **Technical SEO**: 25 punti (con Core Web Vitals se PageSpeed disponibile)
- **On-Page SEO**: 25 punti
- **Local SEO**: 20 punti
- **Off-Page SEO**: 10 punti
- **AEO/RAO**: 20 punti (FIRST-MOVER - analisi esclusiva)

**Con PageSpeed Insights**: Lo score Technical SEO usa Core Web Vitals reali (LCP, CLS, TBT, FCP) con pesi ottimizzati. Le metriche sono separate per mobile e desktop.

**Senza PageSpeed**: Usa metriche stimate basate su tempo di caricamento HTML.

**AEO/RAO**: Valuta struttura Q&A, schema markup per AI, contenuti citabili, ottimizzazione semantica, formato e leggibilità, e autorevolezza del dominio.

## 🎨 Design

- **Colori principali**: Blu (#116df8) e Antracite (#212121)
- **Priorità**: Rosso (Alta), Giallo (Media), Verde (Bassa)
- **UI**: Moderna, pulita, responsive
- **Branding**: Ctrl Studio logo e CtrlSEOCheck

## 🔧 Configurazione

### Backend

Modifica `backend/src/config.ts` per:
- Timeout richieste
- User agent per scraping
- Durata cache (default: 24h)

Crea `backend/.env` per:
- `PAGESPEED_API_KEY` (opzionale ma consigliato)

### Frontend

Crea `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:3001
```

## 📝 Note Tecniche

- **Web Scraping**: Utilizza Cheerio per parsing HTML (più leggero di Puppeteer)
- **PageSpeed Insights**: Integrazione opzionale per metriche reali (25k richieste/giorno gratis)
- **Cache**: Risultati cachati per 24h per lo stesso URL
- **Rate Limiting**: 30 richieste ogni 15 minuti
- **Storage**: SQLite per storico analisi
- **PDF**: Generato client-side con jsPDF

## 🧪 Test

### Siti di Test Consigliati

1. **Ristorante locale**: Sito con menu, recensioni, localizzazione
2. **Hotel/B&B**: Sito con prenotazioni, mappa, servizi
3. **Artigiano/Professionista**: Sito portfolio con servizi locali

### Esempi URL per Test

Puoi testare l'applicazione con questi siti di esempio (verifica che siano raggiungibili):

- `https://www.example.com` (sostituisci con un sito reale)
- `https://www.google.com` (per test rapidi)
- Qualsiasi sito web pubblico accessibile

### Checklist Test

Prima di testare, assicurati che:

- [ ] Backend sia in esecuzione su porta 3001
- [ ] Frontend sia in esecuzione
- [ ] Il sito da analizzare sia raggiungibile pubblicamente
- [ ] Il sito non blocchi i bot (alcuni siti potrebbero bloccare richieste automatizzate)
- [ ] (Opzionale) PageSpeed API key configurata per metriche avanzate

### Test Manuale

1. **Test Analisi Base**:
   - Inserisci un URL valido
   - Seleziona settore e località
   - Avvia analisi
   - Verifica che i risultati vengano visualizzati

2. **Test PageSpeed (se configurato)**:
   - Verifica presenza Core Web Vitals nei risultati
   - Controlla raccomandazioni basate su ottimizzazioni reali

3. **Test Competitor**:
   - Aggiungi 1-3 competitor
   - Verifica che il confronto venga mostrato

4. **Test Storico**:
   - Completa un'analisi
   - Vai su "Storico"
   - Verifica che l'analisi sia salvata

5. **Test PDF**:
   - Completa un'analisi
   - Clicca "Genera PDF"
   - Verifica che il PDF venga scaricato correttamente

## 🐛 Troubleshooting

Vedi `TROUBLESHOOTING.md` per soluzioni comuni.

## 📄 Licenza

MIT

## 👥 Contributi

Contributi benvenuti! Apri una issue o una pull request.

## 🔮 Roadmap

- [x] Integrazione PageSpeed Insights API (mobile + desktop)
- [x] Analisi AEO/RAO (Answer Engine Optimization) - FIRST-MOVER
- [x] Distinzione chiara PageSpeed Insights vs Analisi Custom
- [ ] Supporto multi-lingua
- [ ] Dark mode
- [ ] Export Excel/CSV
- [ ] API pubblica per integrazioni
- [ ] Dashboard admin per gestione utenti
- [ ] Notifiche email per analisi completate
