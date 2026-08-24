import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const TIKTOK_UPLOAD_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";

export async function POST(
  request: NextRequest,
) {
  const accessToken =
    request.cookies.get(
      "tiktok_access_token",
    )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error:
          "TikTok non connecté.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body =
      await request.json();

    const videoSize =
      Number(
        body?.videoSize,
      );

    if (
      !Number.isFinite(
        videoSize,
      ) ||
      videoSize <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "videoSize est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Pour notre première version,
     * on utilise un upload en un seul
     * morceau.
     *
     * TikTok autorise ce mode pour
     * les petites vidéos, notamment
     * lorsque la vidéo fait moins
     * de 5 Mo.
     */
    const chunkSize =
      videoSize;

    const totalChunkCount =
      1;

    const response =
      await fetch(
        TIKTOK_UPLOAD_INIT_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json; charset=UTF-8",
          },

          body:
            JSON.stringify({
              source_info: {
                source:
                  "FILE_UPLOAD",

                video_size:
                  videoSize,

                chunk_size:
                  chunkSize,

                total_chunk_count:
                  totalChunkCount,
              },
            }),

          cache:
            "no-store",
        },
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      data?.error?.code !==
        "ok"
    ) {
      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          tiktok:
            data,
        },
        {
          status:
            response.ok
              ? 400
              : response.status,
        },
      );
    }

    const publishId =
      data?.data?.publish_id;

    const uploadUrl =
      data?.data?.upload_url;

    if (
      !publishId ||
      !uploadUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "TikTok n'a pas retourné de publish_id ou upload_url.",
          tiktok:
            data,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      publishId,

      uploadUrl,

      videoSize,

      chunkSize,

      totalChunkCount,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

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