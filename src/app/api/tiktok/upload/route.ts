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

    const videoUrl =
      body?.videoUrl;

    if (
      !videoUrl ||
      typeof videoUrl !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "videoUrl est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

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

          body: JSON.stringify({
            source_info: {
              source:
                "PULL_FROM_URL",

              video_url:
                videoUrl,
            },
          }),

          cache:
            "no-store",
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status:
            response.status,
          tiktok:
            data,
        },
        {
          status: response.status,
        },
      );
    }

    return NextResponse.json({
      success: true,
      tiktok: data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}