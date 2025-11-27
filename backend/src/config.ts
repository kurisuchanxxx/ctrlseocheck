export const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h
export const REQUEST_TIMEOUT_MS = 25_000;
export const MAX_COMPETITORS = 3;
export const SCAN_USER_AGENT =
  "CTRLStudioLocalSeoBot/1.0 (+https://ctrlstudio.example)";
export const SQLITE_DB_PATH = "./seo-audit.sqlite";

// PageSpeed Insights API Key
// Ottieni la tua API key da: https://console.cloud.google.com/apis/credentials
// Abilita "PageSpeed Insights API" nel progetto Google Cloud
export const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || "";

