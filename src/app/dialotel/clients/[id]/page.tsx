import ClientsDashboard from "@/components/dialotel/clients/ClientsDashboard";
import AppShell from "@/components/layout/AppShell";
import { getAllDialotelClients } from "@/services/clients.service";

export default async function DialotelClientsPage() {
  const data =
    await getAllDialotelClients();

  return (
    <AppShell>
      <ClientsDashboard
        clients={data.clients}
        totalClients={data.totalClients}
        crmCalculatedClients={
          data.crmCalculatedClients
        }
      />
    </AppShell>
  );
}