import crypto from "crypto";
import { OffPageSeoMetrics } from "../types";

const seededRandom = (seed: string) => {
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
};

export const simulateOffPageSignals = (url: string): OffPageSeoMetrics => {
  const baseRandom = seededRandom(url);
  const domainAuthorityScore = Math.round(15 + baseRandom * 60);
  const estimatedBacklinks = Math.round(20 + baseRandom * 200);
  const directoryListings = Math.round(5 + baseRandom * 40);

  return {
    estimatedBacklinks,
    directoryListings,
    domainAuthorityScore,
    hasGoogleBusinessProfile: baseRandom > 0.35,
  };
};

