# 🚀 Guida Rapida: Come Configurare l'API Key di PageSpeed Insights

## Passo 1: Ottieni l'API Key da Google Cloud

### 1.1 Vai su Google Cloud Console
Apri il browser e vai su: **https://console.cloud.google.com/**

### 1.2 Accedi con il tuo account Google
Se non hai un account, creane uno (è gratuito).

### 1.3 Crea un Nuovo Progetto (o usa uno esistente)

**Se non hai progetti:**
- Clicca sul menu progetti in alto (dove c'è scritto "Seleziona un progetto")
- Clicca su **"Nuovo Progetto"**
- Inserisci un nome (es: "CtrlSEOCheck" o "SEO-Audit")
- Clicca **"Crea"**
- Aspetta qualche secondo che il progetto venga creato

**Se hai già progetti:**
- Seleziona un progetto esistente dal menu

### 1.4 Abilita PageSpeed Insights API

1. Nel menu a sinistra, vai su **"API e Servizi"** > **"Libreria"**
2. Nella barra di ricerca, digita: **"PageSpeed Insights"**
3. Clicca su **"PageSpeed Insights API"**
4. Clicca il pulsante **"ABILITA"** (blu)
5. Aspetta qualche secondo che l'API venga abilitata

### 1.5 Crea la Chiave API

1. Nel menu a sinistra, vai su **"API e Servizi"** > **"Credenziali"**
2. In alto, clicca su **"Crea credenziali"**
3. Seleziona **"Chiave API"**
4. **COPIA SUBITO LA CHIAVE** che appare (inizia con `AIzaSy...`)
   - ⚠️ **ATTENZIONE**: Questa è l'unica volta che la vedrai completa!
   - Se la perdi, dovrai crearne una nuova

## Passo 2: Configura nel Backend

### 2.1 Vai nella cartella backend
```bash
cd backend
```

### 2.2 Crea il file .env
```bash
touch .env
```

Oppure crealo manualmente con il tuo editor.

### 2.3 Aggiungi la chiave nel file .env

Apri il file `.env` e incolla questo (sostituisci con la TUA chiave):

```
PAGESPEED_API_KEY=AIzaSy...incolla_qui_la_tua_chiave
```

**Esempio:**
```
PAGESPEED_API_KEY=AIzaSyDcBa1234567890abcdefghijklmnopqrstuvwxyz
```

⚠️ **IMPORTANTE**: 
- Non mettere spazi prima o dopo il `=`
- Non mettere virgolette intorno alla chiave
- La chiave deve essere tutta su una riga

### 2.4 Salva il file

## Passo 3: Riavvia il Backend

### 3.1 Ferma il backend
Nel terminale dove è in esecuzione, premi `Ctrl+C`

### 3.2 Riavvia
```bash
npm run dev
```

## Passo 4: Verifica che Funzioni

### 4.1 Controlla i log del backend
Dovresti vedere:
```
SEO audit API running on http://localhost:3001
```

**Se vedi errori** tipo "API key non valida":
- Verifica di aver copiato tutta la chiave
- Verifica che non ci siano spazi nel file .env
- Verifica che l'API sia abilitata nel progetto Google Cloud

### 4.2 Testa un'analisi
1. Vai sul frontend
2. Inserisci un URL (es: `https://www.google.com`)
3. Avvia l'analisi
4. Se funziona, vedrai metriche Core Web Vitals nei risultati!

## 🔒 Sicurezza

⚠️ **NON condividere mai la tua API key!**

- Il file `.env` è già nel `.gitignore` (non verrà committato)
- Non incollare la chiave in chat, email, o repository pubblici
- Se la condividi per sbaglio, vai su Google Cloud e **elimina la chiave**, poi creane una nuova

## ❓ Problemi Comuni

### "API key non valida"
- Verifica di aver copiato tutta la chiave (inizia con `AIzaSy`)
- Controlla che non ci siano spazi nel file .env
- Verifica che l'API PageSpeed Insights sia abilitata

### "Quota esaurita"
- Limite gratuito: 25,000 richieste/giorno
- Se superi, aspetta fino al giorno successivo
- Oppure crea un nuovo progetto Google Cloud

### "API non abilitata"
- Vai su Google Cloud Console
- API e Servizi > Libreria
- Cerca "PageSpeed Insights API"
- Clicca "Abilita"

### Il backend non legge il file .env
- Verifica che il file si chiami esattamente `.env` (con il punto)
- Verifica che sia nella cartella `backend/`
- Riavvia il backend dopo aver creato/modificato il file

## 📝 Struttura File Corretta

```
backend/
├── .env                    ← Il tuo file (NON committarlo!)
├── .env.example           ← Esempio (puoi committarlo)
├── src/
│   └── ...
└── package.json
```

Il file `.env` dovrebbe contenere solo:
```
PAGESPEED_API_KEY=la_tua_chiave_qui
```

## ✅ Checklist Finale

- [ ] Ho creato/accesso un progetto Google Cloud
- [ ] Ho abilitato PageSpeed Insights API
- [ ] Ho creato una chiave API e l'ho copiata
- [ ] Ho creato il file `.env` in `backend/`
- [ ] Ho inserito la chiave nel formato corretto
- [ ] Ho riavviato il backend
- [ ] Ho testato un'analisi e funziona!

## 🎉 Fatto!

Ora il tuo backend usa PageSpeed Insights per metriche reali e accurate!

