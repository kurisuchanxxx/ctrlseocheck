import crypto from "crypto";
import { OffPageSeoMetrics } from "../types";

const seededRandom = (seed: string) => {
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
};

export const simulateOffPageSignals = (url: string): OffPageSeoMetrics => {
  const baseRandom = seededRandom(url);
  
  // Valori più generosi e realistici per PMI locali
  // Domain Authority: range 25-70 (più generoso, PMI locali tipicamente 30-50)
  const domainAuthorityScore = Math.round(25 + baseRandom * 45);
  
  // Backlinks: range 30-150 (più generoso, PMI locali tipicamente 50-100)
  const estimatedBacklinks = Math.round(30 + baseRandom * 120);
  
  // Directory listings: range 8-35 (più generoso, PMI locali tipicamente 10-25)
  const directoryListings = Math.round(8 + baseRandom * 27);
  
  // Google Business Profile: più probabile (70% invece di 65%)
  const hasGoogleBusinessProfile = baseRandom > 0.30;

  return {
    estimatedBacklinks,
    directoryListings,
    domainAuthorityScore,
    hasGoogleBusinessProfile,
  };
};

