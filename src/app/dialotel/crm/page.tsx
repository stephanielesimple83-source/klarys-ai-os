import CrmIntelligenceDashboard from "@/components/dialotel/clients/CrmIntelligenceDashboard";
import AppShell from "@/components/layout/AppShell";

import {
  getAllDialotelClients,
} from "@/services/clients.service";

export default async function DialotelCrmPage() {
  const data =
    await getAllDialotelClients();

  return (
    <AppShell>
      <CrmIntelligenceDashboard
        clients={
          data.clients
        }
        totalClients={
          data.totalClients
        }
        crmCalculatedClients={
          data.crmCalculatedClients
        }
        crmRemainingClients={
          data.crmRemainingClients
        }
        crmAnalysisRunning={
          data.crmAnalysisRunning
        }
      />
    </AppShell>
  );
}