import { getDialotelDashboard } from "@/services/dialotel.service";

export type ConnectedModulesData = {
  dialotel: Awaited<ReturnType<typeof getDialotelDashboard>>;

  shopify: {
    revenue: number;
    orders: number;
  };

  social: {
    views: number;
    engagement: number;
  };

  websites: {
    visitors: number;
    conversions: number;
  };
};

export async function getConnectedModulesData(): Promise<ConnectedModulesData> {
  const dialotel = await getDialotelDashboard();

  return {
    dialotel,

    shopify: {
      revenue: 1245,
      orders: 18,
    },

    social: {
      views: 12840,
      engagement: 6.2,
    },

    websites: {
      visitors: 346,
      conversions: 11,
    },
  };
}