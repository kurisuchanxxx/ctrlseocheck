import { AnalysisResult } from "../types";

export const buildSummary = (result: Omit<AnalysisResult, "summary">) => {
  const highlights = [];
  if (result.technical.hasSsl) highlights.push("Certificato SSL attivo");
  if (result.local.napConsistency) highlights.push("Dati NAP coerenti");
  if (result.onPage.schemaMarkupTypes.length > 0)
    highlights.push("Schema markup rilevato");
  if (result.aeo.hasQaStructure) highlights.push("Struttura Q&A presente (AEO)");
  if (result.aeo.hasFaqSchema || result.aeo.hasHowToSchema || result.aeo.hasArticleSchema)
    highlights.push("Schema AEO ottimizzato (FAQ/HowTo/Article)");

  const quickWins = result.recommendations
    .filter((rec) => rec.priority !== "bassa")
    .slice(0, 5)
    .map((rec) => rec.title);

  const estimatedTimelineWeeks = Math.max(
    2,
    Math.min(12, Math.round(result.recommendations.length / 2))
  );

  return {
    highlights,
    quickWins,
    estimatedTimelineWeeks,
  };
};

