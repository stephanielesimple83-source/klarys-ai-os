import AppShell from "@/components/layout/AppShell";

import CrmCampaignBuilder from "@/components/dialotel/clients/CrmCampaignBuilder";

import {
  getAllDialotelClients,
} from "@/services/clients.service";

interface NewCampaignPageProps {
  searchParams:
    Promise<{
      clientId?: string;
      clientIds?: string;
    }>;
}

function parseClientIds(
  params: {
    clientId?: string;
    clientIds?: string;
  },
): number[] {
  const ids =
    new Set<number>();

  if (
    params.clientId
  ) {
    const singleId =
      Number(
        params.clientId,
      );

    if (
      Number.isInteger(
        singleId,
      ) &&
      singleId >
        0
    ) {
      ids.add(
        singleId,
      );
    }
  }

  if (
    params.clientIds
  ) {
    params.clientIds
      .split(",")
      .map(
        (value) =>
          Number(
            value.trim(),
          ),
      )
      .filter(
        (value) =>
          Number.isInteger(
            value,
          ) &&
          value >
            0,
      )
      .forEach(
        (value) =>
          ids.add(
            value,
          ),
      );
  }

  return Array.from(
    ids,
  );
}

export default async function NewCampaignPage({
  searchParams,
}: NewCampaignPageProps) {
  const params =
    await searchParams;

  const data =
    await getAllDialotelClients();

  const requestedClientIds =
    parseClientIds(
      params,
    );

  /*
   * On garde uniquement
   * les clients réellement présents
   * dans le CRM Dialotel.
   */
  const availableClientIds =
    new Set(
      data.clients.map(
        (
          client,
        ) =>
          client.id,
      ),
    );

  const initialSelectedIds =
    requestedClientIds.filter(
      (
        clientId,
      ) =>
        availableClientIds.has(
          clientId,
        ),
    );

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