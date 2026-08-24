"use client";

import {
  useState,
} from "react";

type UploadResult = {
  success?: boolean;

  tiktok?: {
    data?: {
      publish_id?: string;
    };

    error?: {
      code?: string;
      message?: string;
      log_id?: string;
    };
  };

  error?: string;
};

type StatusResult = {
  success?: boolean;

  tiktok?: {
    data?: {
      status?: string;
    };

    error?: {
      code?: string;
      message?: string;
      log_id?: string;
    };
  };

  error?: string;
};

const DEFAULT_VIDEO_URL =
  "https://klarys-ai-os-alpha.vercel.app/les-seances.mp4";

export default function TikTokUploadPanel() {
  const [videoUrl, setVideoUrl] =
    useState(DEFAULT_VIDEO_URL);

  const [publishId, setPublishId] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function sendVideo() {
    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      const response =
        await fetch(
          "/api/tiktok/upload",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              videoUrl,
            }),
          },
        );

      const data: UploadResult =
        await response.json();

      if (!response.ok || !data.success) {
        const tikTokMessage =
          data.tiktok?.error
            ?.message;

        const tikTokCode =
          data.tiktok?.error
            ?.code;

        throw new Error(
          tikTokMessage ||
            tikTokCode ||
            data.error ||
            "TikTok a refusé l'envoi.",
        );
      }

      const newPublishId =
        data.tiktok?.data
          ?.publish_id;

      if (!newPublishId) {
        throw new Error(
          "TikTok n'a pas retourné de publish_id.",
        );
      }

      setPublishId(
        newPublishId,
      );

      setMessage(
        "Vidéo envoyée à TikTok avec succès.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la vidéo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus() {
    if (!publishId) {
      setMessage(
        "Aucun publish_id disponible.",
      );

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/tiktok/publish-status",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              publishId,
            }),
          },
        );

      const data: StatusResult =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.tiktok?.error
            ?.message ||
            data.tiktok?.error
              ?.code ||
            data.error ||
            "Impossible de récupérer le statut.",
        );
      }

      const currentStatus =
        data.tiktok?.data
          ?.status ??
        "Statut inconnu";

      setStatus(
        currentStatus,
      );

      setMessage(
        "Statut TikTok mis à jour.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de récupérer le statut.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-violet-500/20 bg-slate-900 p-7">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
          Envoi TikTok
        </p>

        <h2 className="text-2xl font-bold text-white">
          Publier une vidéo
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Envoie une vidéo vers
          TikTok directement depuis
          Klarys AI OS.
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="videoUrl"
          className="text-sm font-semibold text-slate-300"
        >
          URL publique de la vidéo
        </label>

        <input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(event) =>
            setVideoUrl(
              event.target.value,
            )
          }
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
          placeholder="https://..."
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={sendVideo}
          disabled={
            loading ||
            !videoUrl
          }
          className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Traitement..."
            : "Envoyer vers TikTok"}
        </button>

        {publishId && (
          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            Vérifier le statut
          </button>
        )}
      </div>

      {publishId && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Publish ID
          </p>

          <p className="mt-2 break-all text-sm text-slate-300">
            {publishId}
          </p>
        </div>
      )}

      {status && (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm text-slate-400">
            Statut TikTok
          </p>

          <p className="mt-2 font-semibold text-emerald-300">
            {status}
          </p>

          {status ===
            "SEND_TO_USER_INBOX" && (
            <p className="mt-2 text-sm text-slate-400">
              La vidéo a été
              envoyée dans la boîte
              TikTok du compte
              connecté.
            </p>
          )}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-sm text-slate-300">
            {message}
          </p>
        </div>
      )}
    </section>
  );
}