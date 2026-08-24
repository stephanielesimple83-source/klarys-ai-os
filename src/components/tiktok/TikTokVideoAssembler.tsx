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
};

const FFMPEG_CORE_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

export default function TikTokVideoAssembler({
  videoUrls,
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

  useEffect(() => {
    return () => {
      if (finalVideoUrl) {
        URL.revokeObjectURL(
          finalVideoUrl,
        );
      }
    };
  }, [finalVideoUrl]);

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

      const ffmpeg =
        await getFFmpeg();

      /*
       * On nettoie les anciens
       * fichiers s'ils existent.
       */
      const cleanupFiles = [
        "scene1.mp4",
        "scene2.mp4",
        "scene3.mp4",
        "scene4.mp4",
        "list.txt",
        "final.mp4",
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
          // Le fichier n'existe
          // peut-être pas encore.
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

      /*
       * Runway produit normalement
       * des clips ayant les mêmes
       * caractéristiques vidéo.
       *
       * On tente donc d'abord un
       * concat rapide sans réencodage.
       */
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

      /*
       * Si les 4 clips ne peuvent
       * pas être assemblés directement,
       * on fait un second essai en
       * réencodant proprement.
       */
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

  return (
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

          <p className="mt-4 text-center text-sm text-slate-400">
            Prochaine étape :
            sauvegarder ce MP4 dans
            Vercel Blob puis ajouter
            texte, voix et publication
            TikTok.
          </p>
        </div>
      )}
    </section>
  );
}