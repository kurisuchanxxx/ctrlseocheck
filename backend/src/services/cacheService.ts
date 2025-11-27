import NodeCache from "node-cache";
import { CACHE_TTL_SECONDS } from "../config";
import { AnalysisResult } from "../types";

class CacheService {
  private cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

  get(key: string): AnalysisResult | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: AnalysisResult) {
    this.cache.set(key, value);
  }
}

export const cacheService = new CacheService();

