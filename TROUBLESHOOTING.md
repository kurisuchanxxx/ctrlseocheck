# Troubleshooting - SEO Audit Tool

## Errore: "Connessione negata" o "ECONNREFUSED"

### Problema
Il frontend non riesce a connettersi al backend.

### Soluzione

1. **Verifica che il backend sia in esecuzione**:
   ```bash
   cd backend
   npm run dev
   ```
   
   Dovresti vedere:
   ```
   SEO audit API running on http://localhost:3001
   ```

2. **Verifica che la porta 3001 sia libera**:
   ```bash
   lsof -ti:3001
   ```
   Se restituisce un PID, la porta è occupata. Termina il processo o cambia porta.

3. **Testa manualmente il backend**:
   ```bash
   curl http://localhost:3001/health
   ```
   
   Dovresti ricevere: `{"status":"ok"}`

4. **Verifica la configurazione del frontend**:
   - Il file `frontend/src/services/api.ts` usa `http://localhost:3001` come default
   - Se hai un file `.env` in `frontend/`, verifica che `VITE_API_URL=http://localhost:3001`

5. **Riavvia entrambi i servizi**:
   - Termina backend e frontend (Ctrl+C)
   - Riavvia backend: `cd backend && npm run dev`
   - Riavvia frontend: `cd frontend && npm run dev`

## Altri Errori Comuni

### Backend non si avvia

**Errore**: `Cannot find module` o errori TypeScript

**Soluzione**:
```bash
cd backend
npm install
npm run build  # Compila TypeScript
npm run dev
```

### Frontend non si connette

**Errore**: CORS errors o timeout

**Soluzione**:
- Verifica che CORS sia abilitato nel backend (già configurato)
- Verifica che il backend sia sulla porta 3001
- Controlla la console del browser per errori specifici

### Database SQLite errors

**Errore**: `SQLITE_CANTOPEN` o permessi negati

**Soluzione**:
```bash
cd backend
# Verifica i permessi della directory
ls -la seo-audit.sqlite
# Se necessario, crea manualmente il file
touch seo-audit.sqlite
chmod 644 seo-audit.sqlite
```

### Porta già in uso

**Errore**: `EADDRINUSE: address already in use :::3001`

**Soluzione**:
```bash
# Trova il processo che usa la porta
lsof -ti:3001

# Termina il processo (sostituisci PID con il numero trovato)
kill -9 PID

# Oppure cambia porta nel backend/src/index.ts
const PORT = process.env.PORT || 3002;
```

## Checklist Rapida

Prima di segnalare un problema, verifica:

- [ ] Backend in esecuzione su porta 3001
- [ ] Frontend in esecuzione
- [ ] Nessun firewall che blocca localhost:3001
- [ ] Tutte le dipendenze installate (`npm install` in entrambe le cartelle)
- [ ] Nessun errore nella console del browser
- [ ] Nessun errore nei log del backend

## Log Utili

### Backend
I log del backend mostrano:
- Avvio server
- Richieste ricevute
- Errori durante l'analisi

### Frontend
Apri la console del browser (F12) per vedere:
- Errori di connessione
- Errori API
- Warning React

## Supporto

Se il problema persiste:
1. Controlla i log del backend
2. Controlla la console del browser
3. Verifica la versione di Node.js (`node --version` - richiede 18+)
4. Verifica che tutte le dipendenze siano installate

