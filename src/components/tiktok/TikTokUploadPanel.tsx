"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  upload,
} from "@vercel/blob/client";

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

function formatFileSize(
  size: number,
) {
  if (size < 1024) {
    return `${size} octets`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} Ko`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
}

function getStatusLabel(
  status: string,
) {
  switch (status) {
    case "SEND_TO_USER_INBOX":
      return "Envoyée dans TikTok";

    case "PROCESSING_UPLOAD":
      return "Vidéo en cours de traitement";

    case "PROCESSING_DOWNLOAD":
      return "TikTok récupère la vidéo";

    case "PUBLISH_COMPLETE":
      return "Publication terminée";

    case "FAILED":
      return "Échec du traitement";

    default:
      return status;
  }
}

export default function TikTokUploadPanel() {
  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState("");

  const [
    publicVideoUrl,
    setPublicVideoUrl,
  ] =
    useState("");

  const [
    caption,
    setCaption,
  ] =
    useState("");

  const [
    hashtags,
    setHashtags,
  ] =
    useState("");

  const [
    publishId,
    setPublishId,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] =
    useState(0);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");

      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile,
      );

    setPreviewUrl(
      objectUrl,
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      );
    };
  }, [selectedFile]);

  const finalCaption =
    useMemo(() => {
      const cleanCaption =
        caption.trim();

      const cleanHashtags =
        hashtags
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((tag) =>
            tag.startsWith("#")
              ? tag
              : `#${tag}`,
          )
          .join(" ");

      return [
        cleanCaption,
        cleanHashtags,
      ]
        .filter(Boolean)
        .join("\n\n");
    }, [
      caption,
      hashtags,
    ]);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    setSelectedFile(
      file,
    );

    setPublicVideoUrl("");
    setPublishId("");
    setStatus("");
    setMessage("");
    setUploadProgress(0);
  }

  async function uploadVideoToBlob() {
    if (!selectedFile) {
      throw new Error(
        "Choisis d'abord une vidéo.",
      );
    }

    setMessage(
      "Upload de la vidéo en cours...",
    );

    const blob =
      await upload(
        selectedFile.name,
        selectedFile,
        {
          access:
            "public",

          handleUploadUrl:
            "/api/tiktok/video-upload",

          multipart:
            true,

          onUploadProgress:
            (progress) => {
              setUploadProgress(
                Math.round(
                  progress.percentage,
                ),
              );
            },
        },
      );

    setPublicVideoUrl(
      blob.url,
    );

    return blob.url;
  }

  async function sendVideo() {
    if (!selectedFile) {
      setMessage(
        "Choisis une vidéo avant l'envoi.",
      );

      return;
    }

    setLoading(true);
    setMessage("");
    setStatus("");
    setPublishId("");

    try {
      const blobUrl =
        await uploadVideoToBlob();

      setMessage(
        "Vidéo hébergée. Envoi vers TikTok...",
      );

      const response =
        await fetch(
          "/api/tiktok/upload",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                videoUrl:
                  blobUrl,

                caption:
                  finalCaption,
              }),
          },
        );

      const data: UploadResult =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
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

            body:
              JSON.stringify({
                publishId,
              }),
          },
        );

      const data: StatusResult =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
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
          Préparer une vidéo
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Choisis une vidéo sur ton PC,
          prépare ton texte puis
          envoie-la vers TikTok.
        </p>
      </div>

      <div className="mt-7">
        <label
          htmlFor="videoFile"
          className="text-sm font-semibold text-slate-300"
        >
          Choisir une vidéo
        </label>

        <input
          id="videoFile"
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={
            handleFileChange
          }
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:font-semibold file:text-white"
        />
      </div>

      {selectedFile && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="aspect-[9/16] w-full bg-black object-contain"
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vidéo sélectionnée
            </p>

            <p className="mt-3 break-all font-semibold text-white">
              {
                selectedFile.name
              }
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Taille :{" "}
              {formatFileSize(
                selectedFile.size,
              )}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Type :{" "}
              {
                selectedFile.type
              }
            </p>

            {loading &&
              uploadProgress > 0 &&
              uploadProgress < 100 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>
                      Upload
                    </span>

                    <span>
                      {
                        uploadProgress
                      }%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-violet-500 transition-all"
                      style={{
                        width:
                          `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {publicVideoUrl && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  Vidéo hébergée
                </p>

                <p className="mt-2 break-all text-xs text-slate-400">
                  {
                    publicVideoUrl
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-7">
        <label
          htmlFor="caption"
          className="text-sm font-semibold text-slate-300"
        >
          Légende TikTok
        </label>

        <textarea
          id="caption"
          value={caption}
          onChange={(event) =>
            setCaption(
              event.target.value,
            )
          }
          rows={5}
          maxLength={2200}
          className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
          placeholder="Écris ici le texte de ta publication..."
        />

        <div className="mt-1 text-right text-xs text-slate-500">
          {caption.length} /
          2200
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="hashtags"
          className="text-sm font-semibold text-slate-300"
        >
          Hashtags
        </label>

        <input
          id="hashtags"
          type="text"
          value={hashtags}
          onChange={(event) =>
            setHashtags(
              event.target.value,
            )
          }
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
          placeholder="#klarys #bienetre #tiktok"
        />
      </div>

      {finalCaption && (
        <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            Aperçu du texte
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {finalCaption}
          </p>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={sendVideo}
          disabled={
            loading ||
            !selectedFile
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
            onClick={
              checkStatus
            }
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
            {getStatusLabel(
              status,
            )}
          </p>

          {status ===
            "SEND_TO_USER_INBOX" && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              La vidéo a été
              envoyée dans la boîte
              TikTok du compte
              connecté.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-600">
            Code technique :{" "}
            {status}
          </p>
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