# Setup PageSpeed Insights API

## Passi per Configurare l'API Key

### 1. Crea/Accedi a Google Cloud Console
Vai su: https://console.cloud.google.com/

### 2. Crea un Progetto (se non ne hai uno)
- Clicca sul menu progetti in alto
- "Nuovo Progetto"
- Inserisci nome (es: "CtrlSEOCheck")
- Clicca "Crea"

### 3. Abilita PageSpeed Insights API
- Vai su "API e Servizi" > "Libreria"
- Cerca "PageSpeed Insights API"
- Clicca "Abilita"

### 4. Crea API Key
- Vai su "API e Servizi" > "Credenziali"
- Clicca "Crea credenziali" > "Chiave API"
- Copia la chiave generata

### 5. Configura nel Backend

**Opzione A: File .env (Consigliato)**
```bash
cd backend
cp .env.example .env
# Apri .env e incolla la tua API key
PAGESPEED_API_KEY=AIzaSy...la_tua_chiave_qui
```

**Opzione B: Variabile d'ambiente**
```bash
export PAGESPEED_API_KEY=AIzaSy...la_tua_chiave_qui
```

**Opzione C: Avvio con variabile**
```bash
PAGESPEED_API_KEY=AIzaSy... npm run dev
```

### 6. Verifica Configurazione

Riavvia il backend e verifica nei log che non ci siano errori di API key.

## Limiti Quota

- **Gratuito**: 25,000 richieste/giorno
- **Pagamento**: $5 per 1,000 richieste aggiuntive

Per la maggior parte dei casi d'uso, il limite gratuito è più che sufficiente.

## Sicurezza

⚠️ **IMPORTANTE**: Non committare mai la tua API key nel repository!

- Il file `.env` è già nel `.gitignore`
- Non condividere mai la chiave pubblicamente
- Considera di limitare la chiave a specifici IP se possibile

## Test

Dopo la configurazione, esegui un'analisi. Se PageSpeed è configurato correttamente:
- Vedrai metriche Core Web Vitals nei risultati
- Il performance score sarà più accurato
- Vedrai raccomandazioni basate su ottimizzazioni reali

Se non funziona:
- Verifica che l'API sia abilitata
- Controlla i log del backend per errori
- Verifica che la chiave sia corretta

