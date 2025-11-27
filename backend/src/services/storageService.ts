import Database from "better-sqlite3";
import { SQLITE_DB_PATH } from "../config";
import { AnalysisResult } from "../types";

export class StorageService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(SQLITE_DB_PATH);
    this.bootstrap();
  }

  private bootstrap() {
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          businessType TEXT NOT NULL,
          location TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          payload TEXT NOT NULL
        )`
      )
      .run();
  }

  saveAnalysis(result: AnalysisResult) {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO analyses (id, url, businessType, location, timestamp, payload)
         VALUES (@id, @url, @businessType, @location, @timestamp, @payload)`
      )
      .run({
        id: result.id,
        url: result.url,
        businessType: result.businessType,
        location: result.location,
        timestamp: result.timestamp,
        payload: JSON.stringify(result),
      });
  }

  getAnalyses(): AnalysisResult[] {
    const rows = this.db
      .prepare(`SELECT payload FROM analyses ORDER BY datetime(timestamp) DESC`)
      .all() as Array<{ payload: string }>;
    return rows.map((row) => JSON.parse(row.payload) as AnalysisResult);
  }

  getAnalysis(id: string): AnalysisResult | undefined {
    const row = this.db
      .prepare(`SELECT payload FROM analyses WHERE id = ?`)
      .get(id) as { payload: string } | undefined;
    return row ? (JSON.parse(row.payload) as AnalysisResult) : undefined;
  }
}

export const storageService = new StorageService();

