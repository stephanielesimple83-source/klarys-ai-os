"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FFmpeg,
} from "@ffmpeg/ffmpeg";

import {
  fetchFile,
  toBlobURL,
} from "@ffmpeg/util";

type TikTokVideoAssemblerProps = {
  videoUrls: string[];
  overlayTexts: string[];
};

const FFMPEG_CORE_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

const FONT_URL =
  "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf";

function wrapText(
  value: string,
  maxChars = 28,
) {
  const words =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const lines: string[] = [];
  let currentLine = "";

  for (
    const word of words
  ) {
    const candidate =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    if (
      candidate.length <=
      maxChars
    ) {
      currentLine =
        candidate;

      continue;
    }

    if (currentLine) {
      lines.push(
        currentLine,
      );
    }

    currentLine =
      word;
  }

  if (currentLine) {
    lines.push(
      currentLine,
    );
  }

  return lines
    .slice(0, 3)
    .join("\n");
}

export default function TikTokVideoAssembler({
  videoUrls,
  overlayTexts,
}: TikTokVideoAssemblerProps) {
  const ffmpegRef =
    useRef<FFmpeg | null>(
      null,
    );

  const [
    assembling,
    setAssembling,
  ] =
    useState(false);

  const [
    progress,
    setProgress,
  ] =
    useState(0);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    finalVideoUrl,
    setFinalVideoUrl,
  ] =
    useState("");

  const [
    textLoading,
    setTextLoading,
  ] =
    useState(false);

  const [
    textProgress,
    setTextProgress,
  ] =
    useState(0);

  const [
    textMessage,
    setTextMessage,
  ] =
    useState("");

  const [
    textVideoUrl,
    setTextVideoUrl,
  ] =
    useState("");

  useEffect(() => {
    return () => {
      if (finalVideoUrl) {
        URL.revokeObjectURL(
          finalVideoUrl,
        );
      }

      if (textVideoUrl) {
        URL.revokeObjectURL(
          textVideoUrl,
        );
      }
    };
  }, [
    finalVideoUrl,
    textVideoUrl,
  ]);

  async function getFFmpeg() {
    if (
      ffmpegRef.current
    ) {
      return ffmpegRef.current;
    }

    setMessage(
      "Chargement du moteur vidéo...",
    );
    setProgress(5);

    const ffmpeg =
      new FFmpeg();

    ffmpeg.on(
      "log",
      ({ message }) => {
        console.log(
          "[ffmpeg]",
          message,
        );
      },
    );

    await ffmpeg.load({
      coreURL:
        await toBlobURL(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
          "text/javascript",
        ),

      wasmURL:
        await toBlobURL(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
    });

    ffmpegRef.current =
      ffmpeg;

    setProgress(10);

    return ffmpeg;
  }

  async function assembleVideos() {
    if (
      videoUrls.length !== 4 ||
      videoUrls.some(
        (url) => !url,
      )
    ) {
      setMessage(
        "Les 4 vidéos doivent être terminées avant l'assemblage.",
      );

      return;
    }

    setAssembling(true);
    setMessage("");
    setProgress(0);

    try {
      if (finalVideoUrl) {
        URL.revokeObjectURL(
          finalVideoUrl,
        );

        setFinalVideoUrl(
          "",
        );
      }

      if (textVideoUrl) {
        URL.revokeObjectURL(
          textVideoUrl,
        );

        setTextVideoUrl(
          "",
        );
      }

      const ffmpeg =
        await getFFmpeg();

      const cleanupFiles = [
        "scene1.mp4",
        "scene2.mp4",
        "scene3.mp4",
        "scene4.mp4",
        "list.txt",
        "final.mp4",
        "texted.mp4",
        "arial.ttf",
        "text1.txt",
        "text2.txt",
        "text3.txt",
        "text4.txt",
      ];

      for (
        const filename of
        cleanupFiles
      ) {
        try {
          await ffmpeg.deleteFile(
            filename,
          );
        } catch {
          // Fichier absent.
        }
      }

      setMessage(
        "Récupération des 4 scènes...",
      );

      for (
        let index = 0;
        index < videoUrls.length;
        index++
      ) {
        const filename =
          `scene${index + 1}.mp4`;

        await ffmpeg.writeFile(
          filename,
          await fetchFile(
            videoUrls[index],
          ),
        );

        setProgress(
          15 +
            (index + 1) * 10,
        );
      }

      const concatList = [
        "file 'scene1.mp4'",
        "file 'scene2.mp4'",
        "file 'scene3.mp4'",
        "file 'scene4.mp4'",
      ].join("\n");

      await ffmpeg.writeFile(
        "list.txt",
        new TextEncoder().encode(
          concatList,
        ),
      );

      setMessage(
        "Assemblage de la vidéo...",
      );
      setProgress(65);

      let exitCode =
        await ffmpeg.exec([
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          "list.txt",
          "-c",
          "copy",
          "-movflags",
          "+faststart",
          "final.mp4",
        ]);

      if (
        exitCode !== 0
      ) {
        try {
          await ffmpeg.deleteFile(
            "final.mp4",
          );
        } catch {
          // Rien à faire.
        }

        setMessage(
          "Harmonisation des 4 scènes...",
        );
        setProgress(72);

        exitCode =
          await ffmpeg.exec([
            "-i",
            "scene1.mp4",
            "-i",
            "scene2.mp4",
            "-i",
            "scene3.mp4",
            "-i",
            "scene4.mp4",
            "-filter_complex",
            "[0:v:0][1:v:0][2:v:0][3:v:0]concat=n=4:v=1:a=0[outv]",
            "-map",
            "[outv]",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            "final.mp4",
          ]);
      }

      if (
        exitCode !== 0
      ) {
        throw new Error(
          "FFmpeg n'a pas réussi à assembler les 4 scènes.",
        );
      }

      setProgress(92);
      setMessage(
        "Préparation de l'aperçu final...",
      );

      const output =
        await ffmpeg.readFile(
          "final.mp4",
        );

      if (
        typeof output ===
        "string"
      ) {
        throw new Error(
          "Format de sortie vidéo inattendu.",
        );
      }

      const bytes =
        new Uint8Array(
          output,
        );

      const blob =
        new Blob(
          [bytes],
          {
            type:
              "video/mp4",
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      setFinalVideoUrl(
        url,
      );

      setProgress(100);
      setMessage(
        "Vidéo de 20 secondes assemblée avec succès.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'assembler les vidéos.",
      );
    } finally {
      setAssembling(false);
    }
  }

  async function addTextOverlays() {
    if (!finalVideoUrl) {
      setTextMessage(
        "Assemble d'abord les 4 scènes.",
      );

      return;
    }

    const texts =
      overlayTexts
        .map(
          (text) =>
            text.trim(),
        )
        .filter(Boolean)
        .slice(0, 4);

    if (
      texts.length === 0
    ) {
      setTextMessage(
        "Aucun texte n'est disponible pour la vidéo.",
      );

      return;
    }

    setTextLoading(true);
    setTextProgress(0);
    setTextMessage(
      "Préparation des textes...",
    );

    try {
      if (textVideoUrl) {
        URL.revokeObjectURL(
          textVideoUrl,
        );

        setTextVideoUrl(
          "",
        );
      }

      const ffmpeg =
        await getFFmpeg();

      try {
        await ffmpeg.deleteFile(
          "texted.mp4",
        );
      } catch {
        // Fichier absent.
      }

      setTextProgress(10);

      /*
       * La documentation officielle
       * ffmpeg.wasm utilise un fichier
       * TTF chargé dans le système de
       * fichiers virtuel pour drawtext.
       */
      await ffmpeg.writeFile(
        "arial.ttf",
        await fetchFile(
          FONT_URL,
        ),
      );

      setTextProgress(20);

      const fourTexts = [
        texts[0] ??
          "",
        texts[1] ??
          texts[0] ??
          "",
        texts[2] ??
          texts[1] ??
          "",
        texts[3] ??
          texts[2] ??
          texts[0] ??
          "",
      ];

      for (
        let index = 0;
        index < 4;
        index++
      ) {
        await ffmpeg.writeFile(
          `text${index + 1}.txt`,
          new TextEncoder().encode(
            wrapText(
              fourTexts[index],
            ),
          ),
        );
      }

      setTextProgress(35);
      setTextMessage(
        "Ajout des textes à l'écran...",
      );

      const filters = [
        "drawtext=fontfile=/arial.ttf:textfile=/text1.txt:fontcolor=white:fontsize=52:line_spacing=10:box=1:boxcolor=black@0.50:boxborderw=24:x=(w-text_w)/2:y=h-text_h-170:enable='between(t,0,5)'",
        "drawtext=fontfile=/arial.ttf:textfile=/text2.txt:fontcolor=white:fontsize=52:line_spacing=10:box=1:boxcolor=black@0.50:boxborderw=24:x=(w-text_w)/2:y=h-text_h-170:enable='between(t,5,10)'",
        "drawtext=fontfile=/arial.ttf:textfile=/text3.txt:fontcolor=white:fontsize=52:line_spacing=10:box=1:boxcolor=black@0.50:boxborderw=24:x=(w-text_w)/2:y=h-text_h-170:enable='between(t,10,15)'",
        "drawtext=fontfile=/arial.ttf:textfile=/text4.txt:fontcolor=white:fontsize=52:line_spacing=10:box=1:boxcolor=black@0.50:boxborderw=24:x=(w-text_w)/2:y=h-text_h-170:enable='between(t,15,20)'",
      ].join(",");

      const exitCode =
        await ffmpeg.exec([
          "-i",
          "final.mp4",
          "-vf",
          filters,
          "-an",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "22",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          "texted.mp4",
        ]);

      if (
        exitCode !== 0
      ) {
        throw new Error(
          "FFmpeg n'a pas réussi à ajouter les textes.",
        );
      }

      setTextProgress(85);
      setTextMessage(
        "Préparation de la vidéo avec texte...",
      );

      const output =
        await ffmpeg.readFile(
          "texted.mp4",
        );

      if (
        typeof output ===
        "string"
      ) {
        throw new Error(
          "Format vidéo inattendu après ajout des textes.",
        );
      }

      const bytes =
        new Uint8Array(
          output,
        );

      const blob =
        new Blob(
          [bytes],
          {
            type:
              "video/mp4",
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      setTextVideoUrl(
        url,
      );

      setTextProgress(100);
      setTextMessage(
        "Textes ajoutés avec succès.",
      );
    } catch (error) {
      setTextMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter les textes.",
      );
    } finally {
      setTextLoading(false);
    }
  }

  return (
    <>
      <section className="mt-7 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
          Étape 4
        </p>

        <h3 className="mt-2 text-xl font-bold text-white">
          Assembler la vidéo TikTok
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Les quatre clips Runway vont
          être réunis dans ton navigateur
          en un seul MP4 vertical
          d&apos;environ 20 secondes.
          Cette étape ne génère aucune
          nouvelle vidéo Runway.
        </p>

        <button
          type="button"
          onClick={
            assembleVideos
          }
          disabled={
            assembling ||
            videoUrls.length !== 4
          }
          className="mt-5 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {assembling
            ? "🎞️ Assemblage en cours..."
            : finalVideoUrl
              ? "🎞️ Réassembler la vidéo"
              : "🎞️ Assembler les 4 scènes"}
        </button>

        {(assembling ||
          progress > 0) && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {message ||
                  "Préparation..."}
              </span>

              <span>
                {progress} %
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {finalVideoUrl && (
          <div className="mt-7">
            <p className="mb-3 font-semibold text-emerald-300">
              ✓ Vidéo finale prête
            </p>

            <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-black">
              <video
                src={
                  finalVideoUrl
                }
                controls
                playsInline
                className="aspect-[9/16] w-full object-contain"
              />
            </div>
          </div>
        )}
      </section>

      {finalVideoUrl && (
        <section className="mt-7 rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fuchsia-300">
            Étape 5
          </p>

          <h3 className="mt-2 text-xl font-bold text-white">
            Habiller la vidéo
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Ajoute automatiquement les
            textes préparés par Klarys AI
            OS sur les quatre séquences.
            Chaque texte reste environ
            5 secondes à l&apos;écran.
          </p>

          <button
            type="button"
            onClick={
              addTextOverlays
            }
            disabled={
              textLoading
            }
            className="mt-5 rounded-xl bg-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {textLoading
              ? "📝 Ajout des textes..."
              : textVideoUrl
                ? "📝 Refaire les textes"
                : "📝 Ajouter les textes à l'écran"}
          </button>

          {(textLoading ||
            textProgress > 0 ||
            textMessage) && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                <span>
                  {textMessage}
                </span>

                {textProgress > 0 && (
                  <span>
                    {textProgress} %
                  </span>
                )}
              </div>

              {textProgress > 0 && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-fuchsia-400 transition-all duration-500"
                    style={{
                      width:
                        `${textProgress}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {textVideoUrl && (
            <div className="mt-7">
              <p className="mb-3 font-semibold text-emerald-300">
                ✓ Vidéo avec textes prête
              </p>

              <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-black">
                <video
                  src={
                    textVideoUrl
                  }
                  controls
                  playsInline
                  className="aspect-[9/16] w-full object-contain"
                />
              </div>

              <p className="mt-4 text-center text-sm text-slate-400">
                Prochaine étape :
                ajouter une voix IA,
                puis sauvegarder la
                vidéo finale dans
                Vercel Blob.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}