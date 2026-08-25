import {
  Buffer,
} from "node:buffer";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  put,
} from "@vercel/blob";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: NextRequest,
) {
  try {
    const contentType =
      request.headers.get(
        "content-type",
      ) || "";

    if (
      !contentType.includes(
        "video/mp4",
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Le fichier doit être une vidéo MP4.",
        },
        {
          status: 400,
        },
      );
    }

    const arrayBuffer =
      await request.arrayBuffer();

    if (
      arrayBuffer.byteLength === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "La vidéo est vide.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * @vercel/blob accepte Buffer
     * comme corps du fichier.
     */
    const videoBuffer =
      Buffer.from(
        arrayBuffer,
      );

    const filename =
      `tiktok/klarys-${Date.now()}.mp4`;

    const blob =
      await put(
        filename,
        videoBuffer,
        {
          access:
            "public",

          contentType:
            "video/mp4",

          addRandomSuffix:
            true,
        },
      );

    return NextResponse.json({
      success: true,

      url:
        blob.url,

      pathname:
        blob.pathname,

      size:
        videoBuffer.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "VIDEO SAVE ERROR",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          message,
      },
      {
        status: 500,
      },
    );
  }
}