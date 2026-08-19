import CrmRelanceCenter from "@/components/dialotel/clients/CrmRelanceCenter";
import AppShell from "@/components/layout/AppShell";
import { getAllDialotelClients } from "@/services/clients.service";

export default async function DialotelRelancePage() {
  const data =
    await getAllDialotelClients();

  return (
    <AppShell>
      <CrmRelanceCenter
        clients={
          data.clients
        }
      />
    </AppShell>
  );
}