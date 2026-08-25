"use client";

import {
  useEffect,
  useState,
} from "react";

type TikTokDraft = {
  videoUrl: string;
  title: string;
  caption: string;
  hashtags: string[];
  hook: string;
  script: string;
  createdAt: string;
};

type SavedStudioProject = {
  version?: number;
  generated?: {
    title?: string;
    hook?: string;
    script?: string;
    caption?: string;
    hashtags?: string[];
  } | null;
};

const DRAFT_KEY =
  "klarys-ai-os:tiktok:current-draft";

const SAVED_FINAL_VIDEO_KEY =
  "klarys-ai-os:tiktok-studio:saved-final-video";

const STUDIO_STORAGE_KEY =
  "klarys-ai-os:tiktok-studio:current-project";

function setNativeValue(
  element:
    HTMLInputElement |
    HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    element instanceof
    HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const descriptor =
    Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    );

  descriptor?.set?.call(
    element,
    value,
  );

  element.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true,
      },
    ),
  );

  element.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true,
      },
    ),
  );
}

function loadDraftFromStorage():
  TikTokDraft | null {
  try {
    /*
     * 1. Brouillon complet préparé
     * par le bouton "Continuer vers TikTok".
     */
    const rawDraft =
      window.localStorage.getItem(
        DRAFT_KEY,
      );

    if (rawDraft) {
      const parsed =
        JSON.parse(
          rawDraft,
        ) as Partial<TikTokDraft>;

      if (
        typeof parsed.videoUrl ===
          "string" &&
        parsed.videoUrl
      ) {
        return {
          videoUrl:
            parsed.videoUrl,

          title:
            parsed.title ??
            "",

          caption:
            parsed.caption ??
            "",

          hashtags:
            Array.isArray(
              parsed.hashtags,
            )
              ? parsed.hashtags
              : [],

          hook:
            parsed.hook ??
            "",

          script:
            parsed.script ??
            "",

          createdAt:
            parsed.createdAt ??
            new Date().toISOString(),
        };
      }
    }

    /*
     * 2. Fallback robuste :
     * si le brouillon n'a pas été créé
     * mais que la vidéo finale est déjà
     * sauvegardée dans Vercel Blob,
     * on reconstruit le brouillon à partir
     * du projet Studio persistant.
     */
    const videoUrl =
      window.localStorage.getItem(
        SAVED_FINAL_VIDEO_KEY,
      );

    if (!videoUrl) {
      return null;
    }

    const rawProject =
      window.localStorage.getItem(
        STUDIO_STORAGE_KEY,
      );

    let project:
      SavedStudioProject | null =
      null;

    if (rawProject) {
      try {
        project =
          JSON.parse(
            rawProject,
          ) as SavedStudioProject;
      } catch {
        project =
          null;
      }
    }

    const generated =
      project?.generated;

    const draft:
      TikTokDraft = {
        videoUrl,

        title:
          generated?.title ??
          "",

        caption:
          generated?.caption ??
          "",

        hashtags:
          Array.isArray(
            generated?.hashtags,
          )
            ? generated.hashtags
            : [],

        hook:
          generated?.hook ??
          "",

        script:
          generated?.script ??
          "",

        createdAt:
          new Date().toISOString(),
      };

    /*
     * On crée aussi le brouillon complet
     * pour les prochains chargements.
     */
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(
        draft,
      ),
    );

    return draft;
  } catch {
    return null;
  }
}

export default function TikTokDraftAutofill() {
  const [
    draft,
    setDraft,
  ] =
    useState<TikTokDraft | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  useEffect(() => {
    const restored =
      loadDraftFromStorage();

    setDraft(
      restored,
    );
  }, []);

  async function injectDraft() {
    if (
      !draft?.videoUrl
    ) {
      setMessage(
        "Aucune vidéo finale sauvegardée n'a été trouvée.",
      );

      return;
    }

    setLoading(true);
    setMessage(
      "Préparation de la vidéo sauvegardée...",
    );

    try {
      const response =
        await fetch(
          draft.videoUrl,
        );

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer la vidéo sauvegardée.",
        );
      }

      const blob =
        await response.blob();

      const file =
        new File(
          [
            blob,
          ],
          "klarys-tiktok-final.mp4",
          {
            type:
              blob.type ||
              "video/mp4",
          },
        );

      const fileInput =
        document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement | null;

      if (!fileInput) {
        throw new Error(
          "Le champ vidéo TikTok n'a pas été trouvé.",
        );
      }

      const transfer =
        new DataTransfer();

      transfer.items.add(
        file,
      );

      fileInput.files =
        transfer.files;

      fileInput.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true,
          },
        ),
      );

      const caption =
        [
          draft.caption,
          ...draft.hashtags,
        ]
          .filter(Boolean)
          .join(" ");

      const textarea =
        document.querySelector(
          "textarea",
        ) as HTMLTextAreaElement | null;

      if (
        textarea &&
        caption
      ) {
        setNativeValue(
          textarea,
          caption,
        );
      }

      setMessage(
        "✓ Vidéo, légende et hashtags chargés automatiquement.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger le brouillon TikTok.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!draft) {
    return (
      <section className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6">
        <p className="font-semibold text-amber-300">
          Aucun brouillon IA détecté
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Retourne dans le Studio IA,
          sauvegarde la vidéo finale
          puis clique sur
          « Continuer vers TikTok ».
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
        Brouillon Klarys AI OS
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">
        Ta vidéo IA est prête
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        La vidéo finale, la légende
        et les hashtags sont récupérés
        automatiquement depuis le
        Studio IA.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
        <video
          src={
            draft.videoUrl
          }
          controls
          playsInline
          className="aspect-[9/16] w-full rounded-2xl bg-black object-contain"
        />

        <div>
          {draft.title && (
            <p className="font-semibold text-white">
              {
                draft.title
              }
            </p>
          )}

          {draft.caption && (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {
                draft.caption
              }
            </p>
          )}

          {draft.hashtags.length >
            0 && (
            <p className="mt-3 text-sm text-violet-300">
              {draft.hashtags.join(
                " ",
              )}
            </p>
          )}

          <button
            type="button"
            onClick={
              injectDraft
            }
            disabled={
              loading
            }
            className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Chargement..."
              : "Utiliser cette vidéo pour TikTok"}
          </button>

          {message && (
            <p className="mt-3 text-sm text-slate-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}