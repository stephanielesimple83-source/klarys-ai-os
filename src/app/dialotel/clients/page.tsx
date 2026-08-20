import ClientsDashboard from "@/components/dialotel/clients/ClientsDashboard";
import AppShell from "@/components/layout/AppShell";
import { getAllDialotelClients } from "@/services/clients.service";

// Cette page dépend de l'API Dialotel.
// Elle ne doit pas être pré-générée pendant le build Vercel.
export const dynamic = "force-dynamic";

export default async function DialotelClientsPage() {
  const data = await getAllDialotelClients();

  return (
    <AppShell>
      <ClientsDashboard
        clients={data.clients}
        totalClients={data.totalClients}
        crmCalculatedClients={data.crmCalculatedClients}
      />
    </AppShell>
  );
}