import crypto from "crypto";
import { CompetitorComparison } from "../types";

const pseudoRandom = (seed: string, min = 0, max = 1) => {
  const hash = crypto.createHash("sha1").update(seed).digest("hex");
  const value = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  return min + value * (max - min);
};

export const analyzeCompetitors = (urls: string[]): CompetitorComparison[] => {
  return urls
    .filter((url) => Boolean(url))
    .slice(0, 3)
    .map((url) => {
      const domainAuthority = Math.round(pseudoRandom(url, 20, 75));
      const indexedPages = Math.round(pseudoRandom(url + "pages", 15, 350));
      const speedScore = Math.round(pseudoRandom(url + "speed", 40, 95));
      const contentQuality = Math.round(
        pseudoRandom(url + "content", 50, 1600)
      );
      const hasGoogleBusiness = pseudoRandom(url + "gbp", 0, 1) > 0.4;

      return {
        url,
        domainAuthority,
        indexedPages,
        speedScore,
        contentQuality,
        hasGoogleBusiness,
      };
    });
};

