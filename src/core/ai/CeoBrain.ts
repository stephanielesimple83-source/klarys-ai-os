import type { ConnectedModulesData } from "@/core/integrations/IntegrationManager";

type CeoBrainInput = {
  modulesData: ConnectedModulesData;
  alerts: string[];
  businessScore: number;
};

export function generateCeoRecommendations({
  modulesData,
  alerts,
  businessScore,
}: CeoBrainInput): string[] {
  const recommendations: string[] = [];

  if (businessScore >= 90) {
    recommendations.push(
      "Excellente dynamique. Continue les actions actuelles."
    );
  }

  if (modulesData.dialotel.waitingCalls > 0) {
    recommendations.push(
      "Connecter un expert supplémentaire pour absorber les appels en attente."
    );
  }

  if (modulesData.shopify.orders < 10) {
    recommendations.push(
      "Prévoir un live TikTok pour stimuler les ventes Shopify."
    );
  }

  if (modulesData.social.engagement < 5) {
    recommendations.push(
      "Publier une nouvelle vidéo courte aujourd'hui."
    );
  }

  if (alerts.length === 0) {
    recommendations.push(
      "Aucune alerte détectée. Tous les indicateurs sont au vert."
    );
  }

  return recommendations;
}