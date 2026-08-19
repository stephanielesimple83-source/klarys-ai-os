export interface DialotelStats {
  caCabinet: {
    mois: number;
    aujourdHui: number;
    moisPrecedent: number;
    hier: number;
  };

  caSynergie: {
    mois: number;
    aujourdHui: number;
    moisPrecedent: number;
    hier: number;
  };

  consultations: number;
}

export async function getDialotelStats(): Promise<DialotelStats> {
  const response = await fetch(
    'http://localhost:3005/dialotel/stats',
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Impossible de récupérer les statistiques Dialotel');
  }

  return response.json();
}