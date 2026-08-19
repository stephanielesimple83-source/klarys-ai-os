import type { ConnectedModulesData } from "@/core/integrations/IntegrationManager";

export function calculateBusinessScore(
  data: ConnectedModulesData
): number {
  let score = 0;

  // Dialotel
  score += Math.min(data.dialotel.revenue / 10, 30);
  score += Math.min(data.dialotel.consultations, 20);
  score += Math.min(data.dialotel.connectedExperts * 2, 20);

  // Shopify
  score += Math.min(data.shopify.orders, 10);

  // Réseaux sociaux
  score += Math.min(data.social.engagement * 2, 10);

  // Sites
  score += Math.min(data.websites.conversions, 10);

  return Math.min(Math.round(score), 100);
}