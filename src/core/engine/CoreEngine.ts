import { calculateBusinessScore } from "@/core/analytics/BusinessScore";
import { analyzeKpis } from "@/core/analytics/KpiAnalyzer";
import { generateCeoRecommendations } from "@/core/ai/CeoBrain";
import { getConnectedModulesData } from "@/core/integrations/IntegrationManager";

export type CoreEngineResult = {
  businessScore: number;
  alerts: string[];
  recommendations: string[];
  generatedAt: string;
};

export async function runCoreEngine(): Promise<CoreEngineResult> {
  const modulesData = await getConnectedModulesData();

  const alerts = analyzeKpis(modulesData);

  const businessScore = calculateBusinessScore(modulesData);

  const recommendations = generateCeoRecommendations({
    modulesData,
    alerts,
    businessScore,
  });

  return {
    businessScore,
    alerts,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}