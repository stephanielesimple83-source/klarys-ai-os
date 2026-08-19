import CrmCampaignBuilder from "@/components/dialotel/clients/CrmCampaignBuilder";
import AppShell from "@/components/layout/AppShell";
import { getAllDialotelClients } from "@/services/clients.service";

interface DialotelCampagnesPageProps {
  searchParams:
    Promise<{
      clients?:
        string;
    }>;
}

function parseClientIds(
  value:
    | string
    | undefined,
): number[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map(
          (item) =>
            Number(
              item.trim(),
            ),
        )
        .filter(
          (id) =>
            Number.isInteger(
              id,
            ) &&
            id > 0,
        ),
    ),
  );
}

export default async function DialotelCampagnesPage({
  searchParams,
}: DialotelCampagnesPageProps) {
  const params =
    await searchParams;

  const initialSelectedIds =
    parseClientIds(
      params.clients,
    );

  const data =
    await getAllDialotelClients();

  return (
    <AppShell>
      <CrmCampaignBuilder
        clients={
          data.clients
        }
        initialSelectedIds={
          initialSelectedIds
        }
      />
    </AppShell>
  );
}