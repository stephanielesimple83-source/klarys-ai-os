import type { ConnectedModulesData } from "@/core/integrations/IntegrationManager";

export function analyzeKpis(
  data: ConnectedModulesData
): string[] {
  const alerts: string[] = [];

  if (data.dialotel.waitingCalls > 0) {
    alerts.push(
      `${data.dialotel.waitingCalls} appel(s) en attente`
    );
  }

  if (data.dialotel.connectedExperts < 5) {
    alerts.push(
      "Peu d'experts connectés"
    );
  }

  if (data.shopify.orders < 10) {
    alerts.push(
      "Les commandes Shopify sont faibles"
    );
  }

  if (data.social.engagement < 5) {
    alerts.push(
      "Engagement TikTok/Facebook en baisse"
    );
  }

  return alerts;
}