# SEO Audit Tool - Analisi SEO Automatica per PMI Locali

Applicazione web completa per l'analisi SEO automatica di siti web di PMI locali, con dashboard interattiva, report PDF e sistema di scoring avanzato.

## 🚀 Caratteristiche

- **Analisi Technical SEO**: SSL, velocità, mobile-friendliness, sitemap, robots.txt
- **Analisi On-Page SEO**: Meta tags, heading structure, immagini, contenuti
- **Analisi Local SEO**: NAP consistency, schema markup locale, menzioni località
- **Analisi Off-Page SEO**: Backlinks stimati, directory listings, domain authority
- **Analisi Competitor**: Confronto comparativo con fino a 3 competitor
- **Sistema di Scoring**: Punteggio 0-100 con breakdown per categoria
- **Raccomandazioni Actionable**: Suggerimenti prioritizzati con istruzioni step-by-step
- **Report PDF**: Export professionale brandizzabile
- **Storico Analisi**: Salvataggio e confronto evolutivo
- **✨ PageSpeed Insights Integration**: Metriche reali Core Web Vitals e performance avanzate

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- (Opzionale) Google Cloud API Key per PageSpeed Insights

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

### Technical SEO (30 punti)
- Certificato SSL e scadenza
- **Velocità di caricamento (PageSpeed Insights se configurato)**
- **Core Web Vitals: LCP, CLS, TBT, FCP**
- Mobile-friendliness
- Presenza sitemap.xml
- Presenza robots.txt
- Link rotti
- **Ottimizzazioni risorse (render-blocking, compressione, immagini)**

### On-Page SEO (30 punti)
- Meta title e description
- Heading structure (H1, H2, H3)
- Immagini senza alt text
- Open Graph e Twitter Cards
- Canonical tags
- Schema markup

### Local SEO (25 punti)
- Dati NAP (Name, Address, Phone)
- Consistenza NAP
- Schema markup locale (LocalBusiness)
- Menzioni località nel contenuto
- Pagine dedicate alle località
- Google Business Profile

### Off-Page SEO (15 punti)
- Backlinks stimati
- Directory listings
- Domain Authority

## 📊 Sistema di Scoring

Il punteggio totale (0-100) è calcolato come:
- **Technical SEO**: 30 punti (con Core Web Vitals se PageSpeed disponibile)
- **On-Page SEO**: 30 punti
- **Local SEO**: 25 punti
- **Off-Page SEO**: 15 punti

**Con PageSpeed Insights**: Lo score Technical SEO usa Core Web Vitals reali (LCP, CLS, TBT, FCP) con pesi ottimizzati.

**Senza PageSpeed**: Usa metriche stimate basate su tempo di caricamento HTML.

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

- [x] Integrazione PageSpeed Insights API
- [ ] Supporto multi-lingua
- [ ] Dark mode
- [ ] Export Excel/CSV
- [ ] API pubblica per integrazioni
- [ ] Dashboard admin per gestione utenti
- [ ] Notifiche email per analisi completate
