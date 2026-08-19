"use client";

import {
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Save,
  Send,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Card from "@/components/ui/Card";

import {
  createCampaign,
  getDialotelCampaignPreview,
  publishCampaignToDialotel,
} from "@/services/campaigns.service";

import type {
  DialotelCampaignPreview,
  DialotelPublishResult,
} from "@/services/campaigns.service";

import type {
  DialotelClient,
} from "@/services/clients.service";

import {
  getFrenchPhoneKind,
  isFrenchMobilePhone,
} from "@/utils/phone-utils";

interface CrmCampaignBuilderProps {
  clients:
    DialotelClient[];

  initialSelectedIds?:
    number[];
}

type CampaignChannel =
  | "SMS"
  | "EMAIL";

type SmsTone =
  | "REACTIVATION"
  | "VIP"
  | "RETOUR"
  | "PERSONNALISE";

type CampaignPromotion =
  | "AUTO"
  | "NONE"
  | "RETOUR5"
  | "RETOUR10"
  | "VIP26"
  | "RECONQUETE";

interface PromotionRecommendation {
  code:
    Exclude<
      CampaignPromotion,
      "AUTO"
    >;

  label: string;

  percent: number;

  reason: string;
}

function formatCurrency(
  value: number,
): string {
  return value.toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  );
}

function getPromotionRecommendation(
  client: DialotelClient,
): PromotionRecommendation {
  const days =
    client.daysSinceLastConsultation;

  const segment =
    client.crmSegment;

  const totalSpent =
    client.totalSpent ?? 0;

  if (
    days !== null &&
    days <= 29
  ) {
    return {
      code: "NONE",
      label: "Sans promotion",
      percent: 0,
      reason:
        "Client récemment actif : aucune remise nécessaire.",
    };
  }

  if (
    segment === "VIP"
  ) {
    if (
      days !== null &&
      days >= 365 &&
      totalSpent >= 5000
    ) {
      return {
        code: "RECONQUETE",
        label: "RECONQUETE",
        percent: 20,
        reason:
          "VIP à forte valeur absent depuis plus d'un an : offre de reconquête forte.",
      };
    }

    if (
      days !== null &&
      days >= 90
    ) {
      return {
        code: "VIP26",
        label: "VIP26",
        percent: 15,
        reason:
          "VIP important en phase de réactivation : offre fidélité renforcée.",
      };
    }

    if (
      days !== null &&
      days >= 30
    ) {
      return {
        code: "RETOUR5",
        label: "RETOUR5",
        percent: 5,
        reason:
          "VIP encore relativement récent : petite incitation suffisante.",
      };
    }

    return {
      code: "NONE",
      label: "Sans promotion",
      percent: 0,
      reason:
        "VIP actif : aucune remise recommandée.",
    };
  }

  if (
    segment === "PREMIUM"
  ) {
    if (
      days !== null &&
      days >= 180
    ) {
      return {
        code: "RETOUR10",
        label: "RETOUR10",
        percent: 10,
        reason:
          "Premium inactif depuis plusieurs mois : remise de retour adaptée.",
      };
    }

    if (
      days !== null &&
      days >= 60
    ) {
      return {
        code: "RETOUR5",
        label: "RETOUR5",
        percent: 5,
        reason:
          "Premium en début de décrochage : incitation légère.",
      };
    }

    return {
      code: "NONE",
      label: "Sans promotion",
      percent: 0,
      reason:
        "Premium encore actif ou récemment actif.",
    };
  }

  if (
    segment === "REGULIER"
  ) {
    if (
      days !== null &&
      days >= 365 &&
      totalSpent >= 1000
    ) {
      return {
        code: "RETOUR10",
        label: "RETOUR10",
        percent: 10,
        reason:
          "Client régulier à bonne valeur absent depuis longtemps.",
      };
    }

    if (
      days !== null &&
      days >= 90
    ) {
      return {
        code: "RETOUR5",
        label: "RETOUR5",
        percent: 5,
        reason:
          "Client régulier à réactiver avec une remise légère.",
      };
    }

    return {
      code: "NONE",
      label: "Sans promotion",
      percent: 0,
      reason:
        "Pas de remise nécessaire pour ce profil.",
    };
  }

  if (
    days !== null &&
    days >= 180 &&
    totalSpent >= 500
  ) {
    return {
      code: "RETOUR5",
      label: "RETOUR5",
      percent: 5,
      reason:
        "Ancien client avec historique commercial : petite offre de retour.",
    };
  }

  return {
    code: "NONE",
    label: "Sans promotion",
    percent: 0,
    reason:
      "Aucune promotion recommandée actuellement.",
  };
}

function resolvePromotion(
  client: DialotelClient,
  promotion: CampaignPromotion,
): PromotionRecommendation {
  if (
    promotion === "AUTO"
  ) {
    return getPromotionRecommendation(
      client,
    );
  }

  switch (
    promotion
  ) {
    case "RETOUR5":
      return {
        code: "RETOUR5",
        label: "RETOUR5",
        percent: 5,
        reason:
          "Offre choisie manuellement.",
      };

    case "RETOUR10":
      return {
        code: "RETOUR10",
        label: "RETOUR10",
        percent: 10,
        reason:
          "Offre choisie manuellement.",
      };

    case "VIP26":
      return {
        code: "VIP26",
        label: "VIP26",
        percent: 15,
        reason:
          "Offre choisie manuellement.",
      };

    case "RECONQUETE":
      return {
        code: "RECONQUETE",
        label: "RECONQUETE",
        percent: 20,
        reason:
          "Offre choisie manuellement.",
      };

    case "NONE":
    default:
      return {
        code: "NONE",
        label: "Sans promotion",
        percent: 0,
        reason:
          "Aucune promotion appliquée.",
      };
  }
}

function getPromotionText(
  recommendation:
    PromotionRecommendation,
): string {
  if (
    recommendation.code ===
    "NONE"
  ) {
    return "";
  }

  return (
    ` Profitez de -${recommendation.percent}%` +
    ` avec le code ${recommendation.code}.`
  );
}

function buildSmsMessage(
  client: DialotelClient,
  tone: SmsTone,
  promotion: CampaignPromotion,
): string {
  const name =
    client.pseudo?.trim() ||
    client.name?.trim() ||
    "cher client";

  const expert =
    client.favoriteExpert?.trim() ||
    null;

  const segment =
    client.crmSegment;

  const days =
    client.daysSinceLastConsultation;

  const appliedPromotion =
    resolvePromotion(
      client,
      promotion,
    );

  const promoShort =
    appliedPromotion.code ===
    "NONE"
      ? ""
      : ` -${appliedPromotion.percent}% avec ${appliedPromotion.code}.`;

  const expertShort =
    expert
      ? ` Retrouvez ${expert} selon ses disponibilités.`
      : "";

  const stop =
    " STOP";

  /*
   * Plusieurs versions sont générées,
   * de la plus personnalisée à la plus courte.
   * Le moteur choisit automatiquement
   * la première qui tient dans 1 SMS.
   */
  const candidates:
    string[] =
    [];

  if (
    segment === "VIP" &&
    days !== null &&
    days >= 365
  ) {
    candidates.push(
      `Bonjour ${name}, votre fidélité compte pour Klarys Voyance.${promoShort}${expertShort}${stop}`,
      `Bonjour ${name}, Klarys Voyance aimerait vous retrouver.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "VIP" &&
    days !== null &&
    days >= 90
  ) {
    candidates.push(
      `Bonjour ${name}, votre fidélité compte pour Klarys Voyance.${promoShort}${expertShort}${stop}`,
      `Bonjour ${name}, offre VIP Klarys Voyance.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "VIP"
  ) {
    candidates.push(
      `Bonjour ${name}, merci pour votre fidélité à Klarys Voyance.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "PREMIUM" &&
    days !== null &&
    days >= 365
  ) {
    candidates.push(
      `Bonjour ${name}, Klarys Voyance serait ravie de vous retrouver.${promoShort}${expertShort}${stop}`,
      `Bonjour ${name}, une offre de retour vous attend chez Klarys Voyance.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "PREMIUM"
  ) {
    candidates.push(
      `Bonjour ${name}, Klarys Voyance serait heureuse de vous retrouver.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "REGULIER" &&
    days !== null &&
    days >= 180
  ) {
    candidates.push(
      `Bonjour ${name}, Klarys Voyance pense à vous.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    segment === "REGULIER"
  ) {
    candidates.push(
      `Bonjour ${name}, un petit message de Klarys Voyance.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    tone === "VIP"
  ) {
    candidates.push(
      `Bonjour ${name}, votre fidélité compte pour Klarys Voyance.${promoShort}${expertShort}${stop}`,
    );
  } else if (
    tone === "RETOUR"
  ) {
    candidates.push(
      `Bonjour ${name}, Klarys Voyance serait ravie de vous retrouver.${promoShort}${expertShort}${stop}`,
    );
  } else {
    candidates.push(
      `Bonjour ${name}, Klarys Voyance serait ravie de vous retrouver.${promoShort}${expertShort}${stop}`,
    );
  }

  /*
   * Solutions de secours encore plus courtes.
   * On conserve toujours :
   * - le prénom/pseudo
   * - l'offre si elle existe
   * - STOP
   */
  candidates.push(
    `Bonjour ${name}, Klarys Voyance pense à vous.${promoShort}${expertShort}${stop}`,
    `Bonjour ${name}, une offre Klarys Voyance vous attend.${promoShort}${stop}`,
    `Bonjour ${name}.${promoShort} Klarys Voyance vous attend.${stop}`,
  );

  const normalizedCandidates =
    candidates.map(
      (message) =>
        message
          .replace(/\s+/g, " ")
          .trim(),
    );

  const oneSms =
    normalizedCandidates.find(
      (message) =>
        message.length <=
        160,
    );

  if (
    oneSms
  ) {
    return oneSms;
  }

  /*
   * Cas extrême : nom ou code très long.
   * On garantit un SMS court sans couper
   * le code promotionnel ni STOP.
   */
  const minimal =
    `Bonjour ${name}.${promoShort} Klarys Voyance.${stop}`
      .replace(/\s+/g, " ")
      .trim();

  if (
    minimal.length <=
    160
  ) {
    return minimal;
  }

  /*
   * Dernier filet de sécurité :
   * on raccourcit uniquement le nom affiché,
   * jamais le code promo ni STOP.
   */
  const maxNameLength =
    Math.max(
      1,
      160 -
        (
          `Bonjour .${promoShort} Klarys Voyance.${stop}`
        ).length -
        3,
    );

  const shortName =
    name.length >
    maxNameLength
      ? `${name.slice(
          0,
          maxNameLength,
        )}...`
      : name;

  return (
    `Bonjour ${shortName}.${promoShort} Klarys Voyance.${stop}`
      .replace(/\s+/g, " ")
      .trim()
  );
}

function buildMessage(
  client: DialotelClient,
  tone: SmsTone,
  promotion: CampaignPromotion,
  channel: CampaignChannel,
): string {
  if (
    channel === "SMS"
  ) {
    return buildSmsMessage(
      client,
      tone,
      promotion,
    );
  }

  const name =
    client.pseudo?.trim() ||
    client.name?.trim() ||
    "cher client";

  const expert =
    client.favoriteExpert?.trim() ||
    null;

  const segment =
    client.crmSegment;

  const appliedPromotion =
    resolvePromotion(
      client,
      promotion,
    );

  const promoText =
    getPromotionText(
      appliedPromotion,
    );

  const expertText =
    expert
      ? ` Retrouvez ${expert} selon ses disponibilités.`
      : " Nos experts restent à votre écoute.";

  let message = "";

  if (
    segment === "VIP"
  ) {
    message =
      `Bonjour ${name}, votre fidélité est précieuse pour Klarys Voyance.` +
      promoText +
      expertText;
  } else if (
    segment === "PREMIUM"
  ) {
    message =
      `Bonjour ${name}, nous serions heureux de vous retrouver chez Klarys Voyance.` +
      promoText +
      expertText;
  } else {
    message =
      `Bonjour ${name}, Klarys Voyance serait ravie de vous retrouver.` +
      promoText +
      expertText;
  }

  return message
    .replace(/\s+/g, " ")
    .trim();
}

function getSmsLength(
  message: string,
): number {
  return message.length;
}

function getSmsCount(
  message: string,
): number {
  const length =
    getSmsLength(
      message,
    );

  if (length <= 160) {
    return 1;
  }

  return Math.ceil(
    length / 153,
  );
}


export default function CrmCampaignBuilder({
  clients,
  initialSelectedIds = [],
}: CrmCampaignBuilderProps) {
  const candidates =
    useMemo(
      () =>
        clients
          .filter(
            (client) =>
              client.crmCalculated &&
              client.totalSpent >
                0 &&
              Boolean(
                client.phone ||
                  client.email,
              ),
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        clients,
      ],
    );

  const validInitialIds =
    useMemo(
      () => {
        const candidateIds =
          new Set(
            candidates.map(
              (client) =>
                client.id,
            ),
          );

        return Array.from(
          new Set(
            initialSelectedIds.filter(
              (id) =>
                candidateIds.has(
                  id,
                ),
            ),
          ),
        );
      },
      [
        candidates,
        initialSelectedIds,
      ],
    );

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<number[]>(
      validInitialIds,
    );

  const [
    channel,
    setChannel,
  ] =
    useState<CampaignChannel>(
      "SMS",
    );

  const [
    smsTone,
    setSmsTone,
  ] =
    useState<SmsTone>(
      "REACTIVATION",
    );

  const [
    promotion,
    setPromotion,
  ] =
    useState<CampaignPromotion>(
      "AUTO",
    );

  const [
    messageOverrides,
    setMessageOverrides,
  ] =
    useState<Record<number, string>>(
      {},
    );

  const [
    campaignName,
    setCampaignName,
  ] =
    useState(
      validInitialIds.length >
      0
        ? "Réactivation clients sélectionnés"
        : "Réactivation clients",
    );

  const [
    preview,
    setPreview,
  ] =
    useState(false);

  const [
    campaignSaved,
    setCampaignSaved,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    savedCampaignId,
    setSavedCampaignId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    dialotelPreview,
    setDialotelPreview,
  ] =
    useState<
      DialotelCampaignPreview | null
    >(
      null,
    );

  const [
    loadingDialotelPreview,
    setLoadingDialotelPreview,
  ] =
    useState(
      false,
    );

  const [
    dialotelError,
    setDialotelError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    publishArmed,
    setPublishArmed,
  ] =
    useState(
      false,
    );

  const [
    immediateSendAcknowledged,
    setImmediateSendAcknowledged,
  ] =
    useState(
      false,
    );

  const [
    publishing,
    setPublishing,
  ] =
    useState(
      false,
    );

  const [
    publishResult,
    setPublishResult,
  ] =
    useState<
      DialotelPublishResult | null
    >(
      null,
    );

  const selectedClients =
    useMemo(
      () =>
        candidates.filter(
          (client) =>
            selectedIds.includes(
              client.id,
            ),
        ),
      [
        candidates,
        selectedIds,
      ],
    );

  const fixedPhoneClients =
    useMemo(
      () =>
        selectedClients.filter(
          (client) =>
            getFrenchPhoneKind(
              client.phone,
            ) ===
            "FIXE",
        ),
      [
        selectedClients,
      ],
    );

  const fixedPhoneClientsWithEmail =
    useMemo(
      () =>
        fixedPhoneClients.filter(
          (client) =>
            Boolean(
              client.email,
            ),
        ),
      [
        fixedPhoneClients,
      ],
    );

  const fixedPhoneClientsWithoutEmail =
    useMemo(
      () =>
        fixedPhoneClients.filter(
          (client) =>
            !client.email,
        ),
      [
        fixedPhoneClients,
      ],
    );

  const unknownPhoneClients =
    useMemo(
      () =>
        selectedClients.filter(
          (client) =>
            Boolean(
              client.phone,
            ) &&
            getFrenchPhoneKind(
              client.phone,
            ) ===
              "UNKNOWN",
        ),
      [
        selectedClients,
      ],
    );

  const channelEligibleClients =
    useMemo(
      () =>
        selectedClients.filter(
          (client) =>
            channel ===
            "SMS"
              ? isFrenchMobilePhone(
                  client.phone,
                )
              : Boolean(
                  client.email,
                ),
        ),
      [
        selectedClients,
        channel,
      ],
    );

  const unavailableForChannel =
    selectedClients.length -
    channelEligibleClients.length;

  const campaignValue =
    channelEligibleClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  function toggleClient(
    id: number,
  ) {
    setSelectedIds(
      (current) =>
        current.includes(
          id,
        )
          ? current.filter(
              (
                currentId,
              ) =>
                currentId !==
                id,
            )
          : [
              ...current,
              id,
            ],
    );

    setPreview(
      false,
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  function selectTopClients() {
    setSelectedIds(
      candidates
        .slice(
          0,
          20,
        )
        .map(
          (client) =>
            client.id,
        ),
    );

    setPreview(
      false,
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  function clearSelection() {
    setSelectedIds(
      [],
    );

    setPreview(
      false,
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  function changeChannel(
    newChannel:
      CampaignChannel,
  ) {
    setChannel(
      newChannel,
    );

    setMessageOverrides(
      {},
    );

    setPreview(
      false,
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  function prepareFixedClientsByEmail() {
    if (
      fixedPhoneClientsWithEmail.length ===
      0
    ) {
      return;
    }

    setSelectedIds(
      fixedPhoneClientsWithEmail.map(
        (client) =>
          client.id,
      ),
    );

    changeChannel(
      "EMAIL",
    );
  }

  function getClientMessage(
    client:
      DialotelClient,
  ): string {
    return (
      messageOverrides[
        client.id
      ] ??
      buildMessage(
        client,
        smsTone,
        promotion,
        channel,
      )
    );
  }

  function updateClientMessage(
    clientId:
      number,
    message:
      string,
  ) {
    setMessageOverrides(
      (current) => ({
        ...current,
        [clientId]:
          message,
      }),
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  function resetGeneratedMessages() {
    setMessageOverrides(
      {},
    );

    setPreview(
      false,
    );

    setCampaignSaved(
      false,
    );

    setSaveError(
      null,
    );

    setSavedCampaignId(
      null,
    );

    setDialotelPreview(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );
  }

  async function copyMessage(
    client:
      DialotelClient,
  ) {
    try {
      await navigator.clipboard.writeText(
        getClientMessage(
          client,
        ),
      );
    } catch {
      // Aucun blocage si le presse-papiers
      // n'est pas disponible.
    }
  }

  async function saveCurrentCampaign() {
    if (
      channelEligibleClients.length ===
        0 ||
      saving
    ) {
      return;
    }

    setSaving(
      true,
    );

    setSaveError(
      null,
    );

    try {
      const recipients =
        channelEligibleClients.map(
          (
            client,
          ) => {
            const appliedPromotion =
              resolvePromotion(
                client,
                promotion,
              );

            const message =
              getClientMessage(
                client,
              );

            return {
              clientId:
                client.id,

              name:
                client.name ||
                client.pseudo ||
                `Client ${client.id}`,

              phone:
                client.phone,

              email:
                client.email,

              crmSegment:
                client.crmSegment,

              crmScore:
                client.crmScore,

              totalSpent:
                client.totalSpent,

              consultationsCount:
                client.consultationsCount ??
                0,

              averageSpentPerConsultation:
                client.consultationsCount &&
                client.consultationsCount >
                  0
                  ? Math.round(
                      (
                        client.totalSpent /
                        client.consultationsCount
                      ) *
                        100,
                    ) /
                    100
                  : 0,

              lastConsultationDate:
                client.lastConsultationDate,

              daysSinceLastConsultation:
                client.daysSinceLastConsultation,

              favoriteExpert:
                client.favoriteExpert,

              message,

              promotionCode:
                appliedPromotion.code,

              promotionPercent:
                appliedPromotion.percent,

              promotionReason:
                appliedPromotion.reason,

              smsCount:
                channel ===
                "SMS"
                  ? getSmsCount(
                      message,
                    )
                  : 0,

              messageLength:
                message.length,
            };
          },
        );

      const savedCampaign =
        await createCampaign({
        name:
          campaignName.trim() ||
          "Campagne sans nom",

        channel,

        status:
          "PRETE",

        clientIds:
          recipients.map(
            (
              recipient,
            ) =>
              recipient.clientId,
          ),

        recipientsCount:
          recipients.length,

        historicalValue:
          campaignValue,

        recipients,
      });

      setSavedCampaignId(
        savedCampaign.id,
      );

      setDialotelPreview(
        null,
      );

      setPublishArmed(
        false,
      );

      setImmediateSendAcknowledged(
        false,
      );

      setPublishResult(
        null,
      );

      setCampaignSaved(
        true,
      );
    } catch (
      error
    ) {
      setCampaignSaved(
        false,
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la campagne.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function loadDialotelPreview() {
    if (
      !savedCampaignId ||
      loadingDialotelPreview
    ) {
      return;
    }

    setLoadingDialotelPreview(
      true,
    );

    setDialotelError(
      null,
    );

    setPublishArmed(
      false,
    );

    setImmediateSendAcknowledged(
      false,
    );

    setPublishResult(
      null,
    );

    try {
      const result =
        await getDialotelCampaignPreview(
          savedCampaignId,
        );

      setDialotelPreview(
        result,
      );
    } catch (
      error
    ) {
      setDialotelPreview(
        null,
      );

      setDialotelError(
        error instanceof Error
          ? error.message
          : "Impossible de vérifier la campagne avec Dialotel.",
      );
    } finally {
      setLoadingDialotelPreview(
        false,
      );
    }
  }

  async function publishToDialotel() {
    if (
      !savedCampaignId ||
      !dialotelPreview ||
      !publishArmed ||
      !immediateSendAcknowledged ||
      publishing
    ) {
      return;
    }

    setPublishing(
      true,
    );

    setDialotelError(
      null,
    );

    try {
      const result =
        await publishCampaignToDialotel(
          savedCampaignId,
          {
            sender:
              dialotelPreview.sender,

            confirm:
              publishArmed,

            acknowledgeImmediateSend:
              immediateSendAcknowledged,
          },
        );

      setPublishResult(
        result,
      );

      setPublishArmed(
        false,
      );
    } catch (
      error
    ) {
      setDialotelError(
        error instanceof Error
          ? error.message
          : "La publication Dialotel a échoué.",
      );
    } finally {
      setPublishing(
        false,
      );
    }
  }

  const preparedTotalSms =
    channel ===
    "SMS"
      ? channelEligibleClients.reduce(
          (
            total,
            client,
          ) =>
            total +
            getSmsCount(
              getClientMessage(
                client,
              ),
            ),
          0,
        )
      : 0;

  const preparedEstimatedCost =
    Math.round(
      preparedTotalSms *
        0.06 *
        100,
    ) /
    100;

  const dialotelTotalSms =
    dialotelPreview
      ? dialotelPreview.items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.estimatedSmsCount,
          0,
        )
      : 0;

  const estimatedDialotelCost =
    Math.round(
      dialotelTotalSms *
        0.06 *
        100,
    ) /
    100;

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <p className="text-sm font-medium text-violet-400">
          CEO AI — Campagnes
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-white">
          Préparer une campagne de relance
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Sélectionne les clients à recontacter, choisis le canal puis contrôle chaque message avant validation.
        </p>

        {validInitialIds.length >
          0 && (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-300">
              {validInitialIds.length} client
              {validInitialIds.length !==
              1
                ? "s"
                : ""}{" "}
              importé
              {validInitialIds.length !==
              1
                ? "s"
                : ""}{" "}
              automatiquement depuis le Centre de relance.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-violet-400" />

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Sélectionnés
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {selectedClients.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {channel ===
            "SMS"
              ? "Mobiles SMS"
              : "Joignables en EMAIL"}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {channelEligibleClients.length}
          </p>

          {channel ===
            "SMS" &&
            fixedPhoneClients.length >
              0 && (
            <p className="mt-1 text-xs text-amber-400">
              {fixedPhoneClients.length} fixe
              {fixedPhoneClients.length !==
              1
                ? "s"
                : ""} exclu
              {fixedPhoneClients.length !==
              1
                ? "s"
                : ""} des SMS
            </p>
          )}

          {channel ===
            "EMAIL" &&
            unavailableForChannel >
              0 && (
            <p className="mt-1 text-xs text-amber-400">
              {unavailableForChannel} sans email
            </p>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Valeur historique ciblée
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(
              campaignValue,
            )}{" "}
            €
          </p>
        </Card>
      </div>

      {channel ===
        "SMS" &&
        (
          fixedPhoneClients.length >
            0 ||
          unknownPhoneClients.length >
            0
        ) && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-semibold text-amber-300">
                Numéros non compatibles SMS détectés
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Les numéros fixes 01, 02, 03, 04, 05 et 09 sont automatiquement exclus de la campagne SMS. Ils ne sont donc pas comptés dans le coût.
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {fixedPhoneClients.length >
                  0 && (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-200">
                    {fixedPhoneClients.length} fixe{fixedPhoneClients.length !== 1 ? "s" : ""}
                  </span>
                )}

                {fixedPhoneClientsWithEmail.length >
                  0 && (
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-violet-200">
                    {fixedPhoneClientsWithEmail.length} à contacter par email
                  </span>
                )}

                {fixedPhoneClientsWithoutEmail.length >
                  0 && (
                  <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-rose-200">
                    {fixedPhoneClientsWithoutEmail.length} sans email
                  </span>
                )}

                {unknownPhoneClients.length >
                  0 && (
                  <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-slate-300">
                    {unknownPhoneClients.length} numéro{unknownPhoneClients.length !== 1 ? "s" : ""} à vérifier
                  </span>
                )}
              </div>
            </div>

            {fixedPhoneClientsWithEmail.length >
              0 && (
              <button
                type="button"
                onClick={
                  prepareFixedClientsByEmail
                }
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Mail className="h-4 w-4" />
                Préparer {fixedPhoneClientsWithEmail.length} email{fixedPhoneClientsWithEmail.length !== 1 ? "s" : ""} pour les fixes
              </button>
            )}
          </div>
        </Card>
      )}

      {channel === "SMS" &&
        channelEligibleClients.length >
          0 && (
        <Card className="border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                Campagne SMS prête à préparer
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Seuls les vrais mobiles 06/07 sont inclus. Les fixes sont exclus automatiquement et ne sont pas facturés dans cette estimation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Destinataires
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {channelEligibleClients.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  SMS estimés
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {preparedTotalSms}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Coût estimé
                </p>
                <p className="mt-1 text-lg font-bold text-amber-300">
                  {formatCurrency(
                    preparedEstimatedCost,
                  )} €
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Expéditeur
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  Klarys
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Nom de la campagne
            </label>

            <input
              value={
                campaignName
              }
              onChange={(
                event,
              ) => {
                setCampaignName(
                  event.target.value,
                );

                setCampaignSaved(
                  false,
                );

                setSaveError(
                  null,
                );
              }}
              className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Canal de relance
            </p>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  changeChannel(
                    "SMS",
                  )
                }
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm transition ${
                  channel ===
                  "SMS"
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700 bg-slate-950 text-slate-400"
                }`}
              >
                <MessageSquare className="h-4 w-4" />

                SMS
              </button>

              <button
                type="button"
                onClick={() =>
                  changeChannel(
                    "EMAIL",
                  )
                }
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm transition ${
                  channel ===
                  "EMAIL"
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-slate-700 bg-slate-950 text-slate-400"
                }`}
              >
                <Mail className="h-4 w-4" />

                Email
              </button>
            </div>
          </div>
        </div>

        {channel ===
          "SMS" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Style du SMS
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  [
                    "REACTIVATION",
                    "Réactivation douce",
                  ],
                  [
                    "VIP",
                    "Client VIP",
                  ],
                  [
                    "RETOUR",
                    "Retour client",
                  ],
                  [
                    "PERSONNALISE",
                    "Personnalisé",
                  ],
                ].map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      onClick={() => {
                        setSmsTone(
                          value as SmsTone,
                        );

                        resetGeneratedMessages();
                      }}
                      className={`rounded-xl border px-3 py-3 text-sm transition ${
                        smsTone ===
                        value
                          ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                          : "border-slate-700 bg-slate-950 text-slate-400"
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Offre commerciale
              </p>

              <div className="mt-2 grid gap-2">
                {[
                  {
                    value: "AUTO" as CampaignPromotion,
                    title: "CEO AI — Offre automatique",
                    detail:
                      "Le moteur choisit client par client entre aucune remise, RETOUR5, RETOUR10, VIP26 et RECONQUETE.",
                  },
                  {
                    value: "NONE" as CampaignPromotion,
                    title: "Sans promotion",
                    detail:
                      "Aucune remise appliquée.",
                  },
                  {
                    value: "RETOUR5" as CampaignPromotion,
                    title: "RETOUR5 — remise de 5 %",
                    detail:
                      "Relance légère.",
                  },
                  {
                    value: "RETOUR10" as CampaignPromotion,
                    title: "RETOUR10 — remise de 10 %",
                    detail:
                      "Retour Premium ou client régulier ancien.",
                  },
                  {
                    value: "VIP26" as CampaignPromotion,
                    title: "VIP26 — remise de 15 %",
                    detail:
                      "Réactivation VIP.",
                  },
                  {
                    value: "RECONQUETE" as CampaignPromotion,
                    title: "RECONQUETE — remise de 20 %",
                    detail:
                      "Offre forte réservée aux gros anciens clients.",
                  },
                ].map(
                  (
                    offer,
                  ) => (
                    <button
                      key={
                        offer.value
                      }
                      type="button"
                      onClick={() => {
                        setPromotion(
                          offer.value,
                        );

                        resetGeneratedMessages();
                      }}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                        promotion ===
                        offer.value
                          ? offer.value ===
                            "AUTO"
                            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                            : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-slate-700 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <span className="font-medium">
                        {offer.title}
                      </span>

                      <span className="mt-1 block text-xs opacity-70">
                        {offer.detail}
                      </span>
                    </button>
                  ),
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                En mode CEO AI, l&apos;offre est recommandée individuellement selon le segment CRM, la valeur historique et l&apos;inactivité. Aucun choix ne déclenche un envoi.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={
              selectTopClients
            }
            className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20"
          >
            Sélectionner les 20 meilleurs
          </button>

          <button
            type="button"
            onClick={
              clearSelection
            }
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:text-white"
          >
            Effacer la sélection
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">
          Sélection des clients
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {candidates.length} clients disponibles pour une campagne.
        </p>

        <div className="mt-5 max-h-[600px] space-y-2 overflow-y-auto pr-2">
          {candidates.map(
            (client) => {
              const selected =
                selectedIds.includes(
                  client.id,
                );

              const hasSms =
                Boolean(
                  client.phone,
                );

              const hasEmail =
                Boolean(
                  client.email,
                );

              return (
                <button
                  type="button"
                  key={
                    client.id
                  }
                  onClick={() =>
                    toggleClient(
                      client.id,
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">
                      {client.name ||
                        client.pseudo ||
                        `Client ${client.id}`}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {client.crmSegment ??
                        "—"}{" "}
                      •{" "}
                      {client.consultationsCount ??
                        0}{" "}
                      consultations
                    </p>

                    <div className="mt-2 flex gap-2">
                      {hasSms &&
                        isFrenchMobilePhone(
                          client.phone,
                        ) && (
                        <span className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] text-cyan-300">
                          MOBILE · SMS
                        </span>
                      )}

                      {hasSms &&
                        getFrenchPhoneKind(
                          client.phone,
                        ) ===
                          "FIXE" && (
                        <span className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[10px] text-amber-300">
                          FIXE · PAS DE SMS
                        </span>
                      )}

                      {hasSms &&
                        getFrenchPhoneKind(
                          client.phone,
                        ) ===
                          "UNKNOWN" && (
                        <span className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                          NUMÉRO À VÉRIFIER
                        </span>
                      )}

                      {hasEmail && (
                        <span className="rounded-md border border-violet-500/20 bg-violet-500/5 px-2 py-1 text-[10px] text-violet-300">
                          EMAIL
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(
                        client.totalSpent,
                      )}{" "}
                      €
                    </p>

                    {selected && (
                      <CheckCircle2 className="ml-auto mt-2 h-4 w-4 text-violet-400" />
                    )}
                  </div>
                </button>
              );
            },
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-white">
              {campaignName ||
                "Campagne sans nom"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {channelEligibleClients.length} destinataire
              {channelEligibleClients.length !==
              1
                ? "s"
                : ""}{" "}
              réellement joignable
              {channelEligibleClients.length !==
              1
                ? "s"
                : ""}{" "}
              en {channel}.
            </p>
          </div>

          <button
            type="button"
            disabled={
              channelEligibleClients.length ===
              0
            }
            onClick={() => {
              setPreview(
                true,
              );

              setCampaignSaved(
                false,
              );

              setSaveError(
                null,
              );
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />

            Voir les messages préparés
          </button>
        </div>
      </Card>

      {preview && (
        <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
          <p className="text-sm font-medium text-cyan-400">
            Aperçu avant validation
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            {campaignName ||
              "Campagne sans nom"}
          </h2>

          {channel ===
            "SMS" &&
            promotion ===
              "AUTO" && (
            <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-sm font-medium text-violet-300">
                CEO AI applique une offre différente selon chaque profil.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Les recommandations restent visibles et chaque message peut être modifié avant validation.
              </p>
            </div>
          )}

          <p className="mt-2 text-sm text-slate-400">
            {channelEligibleClients.length} message
            {channelEligibleClients.length !==
            1
              ? "s"
              : ""}{" "}
            préparé
            {channelEligibleClients.length !==
            1
              ? "s"
              : ""}{" "}
            en {channel}. Aucun envoi n&apos;est effectué.
          </p>

          <div className="mt-6 space-y-4">
            {channelEligibleClients.map(
              (client) => (
                <div
                  key={
                    client.id
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">
                        {client.name ||
                          client.pseudo ||
                          `Client ${client.id}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {channel ===
                        "SMS"
                          ? client.phone
                          : client.email}
                      </p>

                      {channel ===
                        "SMS" && (
                        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                          {(() => {
                            const recommended =
                              getPromotionRecommendation(
                                client,
                              );

                            const applied =
                              resolvePromotion(
                                client,
                                promotion,
                              );

                            return (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-medium text-violet-300">
                                    CEO AI recommande :
                                  </span>

                                  <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-200">
                                    {recommended.label}
                                    {recommended.percent >
                                      0
                                      ? ` -${recommended.percent}%`
                                      : ""}
                                  </span>

                                  {promotion !==
                                    "AUTO" && (
                                    <span className="text-xs text-slate-500">
                                      Offre appliquée : {applied.label}
                                      {applied.percent >
                                        0
                                        ? ` -${applied.percent}%`
                                        : ""}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                  {recommended.reason}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <textarea
                        value={
                          getClientMessage(
                            client,
                          )
                        }
                        onChange={(
                          event,
                        ) =>
                          updateClientMessage(
                            client.id,
                            event.target.value,
                          )
                        }
                        rows={
                          channel ===
                          "SMS"
                            ? 4
                            : 6
                        }
                        className="mt-4 w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition focus:border-cyan-500/50"
                      />

                      {channel ===
                        "SMS" && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className="text-slate-500">
                            {getSmsLength(
                              getClientMessage(
                                client,
                              ),
                            )}{" "}
                            caractères
                          </span>

                          <span
                            className={
                              getSmsCount(
                                getClientMessage(
                                  client,
                                ),
                              ) ===
                              1
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {getSmsCount(
                              getClientMessage(
                                client,
                              ),
                            )}{" "}
                            SMS
                          </span>

                          {getSmsLength(
                            getClientMessage(
                              client,
                            ),
                          ) >
                            160 && (
                            <span className="text-amber-400">
                              Message long : vérifie le coût avant envoi.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void copyMessage(
                          client,
                        )
                      }
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <Copy className="h-4 w-4" />

                      Copier
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium text-white">
                Messages vérifiés ?
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Enregistre la sélection pour pouvoir effectuer le contrôle sécurisé dans Dialotel.
              </p>
            </div>

            <button
              type="button"
              disabled={
                campaignSaved ||
                saving
              }
              onClick={() =>
                void saveCurrentCampaign()
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-default disabled:bg-emerald-900 disabled:text-emerald-300"
            >
              {campaignSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />

                  Campagne enregistrée
                </>
              ) : saving ? (
                <>
                  <Save className="h-4 w-4" />

                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />

                  Préparer pour Dialotel
                </>
              )}
            </button>
          </div>

          {saveError && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <p className="text-sm text-rose-300">
                {saveError}
              </p>
            </div>
          )}

          {campaignSaved &&
            savedCampaignId &&
            channel ===
              "SMS" && (
            <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-violet-300">
                    Contrôle final Dialotel
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Contrôle les destinataires, les messages, le nombre de SMS et le coût. Cette étape n&apos;envoie rien.
                  </p>

                  <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                    <p className="text-sm font-medium text-cyan-200">
                      Horaires d&apos;envoi SMS Dialotel
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      Du lundi au samedi, de 08h00 à 20h00 maximum.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Aucun envoi SMS le dimanche.
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    Campagne interne : {savedCampaignId}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    loadingDialotelPreview ||
                    publishing
                  }
                  onClick={() =>
                    void loadDialotelPreview()
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />

                  {loadingDialotelPreview
                    ? "Vérification..."
                    : "Vérifier dans Dialotel — aucun envoi"}
                </button>
              </div>

              {dialotelError && (
                <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <p className="text-sm text-rose-300">
                    {dialotelError}
                  </p>
                </div>
              )}

              {dialotelPreview && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Destinataires
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {dialotelPreview.recipientsCount}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        SMS estimés
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {dialotelTotalSms}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Coût estimé
                      </p>
                      <p className="mt-2 text-2xl font-bold text-amber-300">
                        {formatCurrency(
                          estimatedDialotelCost,
                        )}{" "}
                        €
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        estimation à 0,06 € / SMS
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Expéditeur
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {dialotelPreview.sender}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-sm font-medium text-cyan-300">
                      Aperçu sécurisé validé
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      safePreview : {String(
                        dialotelPreview.safePreview,
                      )} · sendsSms : {String(
                        dialotelPreview.sendsSms,
                      )}
                    </p>
                  </div>

                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
                    {dialotelPreview.items.map(
                      (
                        item,
                      ) => (
                        <div
                          key={
                            item.clientId
                          }
                          className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-medium text-white">
                                {item.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.phone} · {item.promotionCode}{" "}
                                {item.promotionPercent >
                                0
                                  ? `-${item.promotionPercent}%`
                                  : ""}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs ${
                                item.oneSms
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                              }`}
                            >
                              {item.estimatedSmsCount} SMS
                            </span>
                          </div>

                          <p className="mt-3 text-xs leading-5 text-slate-400">
                            {item.dialotelMessage}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {!publishResult && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                      <p className="font-semibold text-amber-300">
                        Prêt pour l&apos;envoi groupé
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Cette confirmation concerne tout le lot. Tu ne valides pas les clients un par un.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Destinataires
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {dialotelPreview.recipientsCount}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            SMS
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {dialotelTotalSms}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Coût estimé
                          </p>
                          <p className="mt-1 text-lg font-bold text-amber-300">
                            {formatCurrency(
                              estimatedDialotelCost,
                            )} €
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Expéditeur
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {dialotelPreview.sender}
                          </p>
                        </div>
                      </div>

                      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                        <input
                          type="checkbox"
                          checked={
                            publishArmed &&
                            immediateSendAcknowledged
                          }
                          onChange={(
                            event,
                          ) => {
                            setPublishArmed(
                              event.target.checked,
                            );

                            setImmediateSendAcknowledged(
                              event.target.checked,
                            );
                          }}
                          className="mt-1 h-4 w-4"
                        />

                        <span className="text-sm leading-6 text-rose-100">
                          Je confirme avoir vérifié ce lot et j&apos;autorise l&apos;envoi réel des{" "}
                          <strong className="text-white">
                            {dialotelTotalSms}
                          </strong>{" "}
                          SMS via Dialotel pour un coût estimé de{" "}
                          <strong className="text-white">
                            {formatCurrency(
                              estimatedDialotelCost,
                            )} €
                          </strong>.
                        </span>
                      </label>

                      <button
                        type="button"
                        disabled={
                          !publishArmed ||
                          !immediateSendAcknowledged ||
                          publishing
                        }
                        onClick={() =>
                          void publishToDialotel()
                        }
                        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 sm:w-auto"
                      >
                        <Send className="h-4 w-4" />

                        {publishing
                          ? `Envoi des ${dialotelTotalSms} SMS en cours...`
                          : `Envoyer les ${dialotelTotalSms} SMS — ${formatCurrency(
                              estimatedDialotelCost,
                            )} €`}
                      </button>
                    </div>
                  )}

                  {publishResult && (
                    <div
                      className={`rounded-xl border p-5 ${
                        publishResult.allSucceeded
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                    >
                      <p
                        className={`font-semibold ${
                          publishResult.allSucceeded
                            ? "text-emerald-300"
                            : "text-amber-300"
                        }`}
                      >
                        {publishResult.allSucceeded
                          ? "Publication Dialotel terminée"
                          : "Publication Dialotel partielle"}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        {publishResult.published} créée
                        {publishResult.published !==
                        1
                          ? "s"
                          : ""} · {publishResult.failed} échec
                        {publishResult.failed !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-300">
              La préparation, l&apos;enregistrement et la vérification n&apos;envoient aucun SMS. Seuls les mobiles 06/07 sont autorisés en SMS ; les fixes sont exclus. Seul le bouton rouge « Envoyer les SMS » déclenche l&apos;envoi réel après ta confirmation.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}