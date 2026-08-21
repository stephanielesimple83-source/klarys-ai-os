import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const TIKTOK_STATUS_URL =
  "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

export async function POST(
  request: NextRequest,
) {
  try {
    const accessToken =
      request.cookies.get(
        "tiktok_access_token",
      )?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Compte TikTok non connecté.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const publishId =
      body?.publishId;

    if (!publishId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "publishId manquant.",
        },
        {
          status: 400,
        },
      );
    }

    const response =
      await fetch(
        TIKTOK_STATUS_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json; charset=UTF-8",
          },

          body: JSON.stringify({
            publish_id:
              publishId,
          }),

          cache: "no-store",
        },
      );

    const data =
      await response.json();

    return NextResponse.json(
      {
        success:
          response.ok &&
          data?.error?.code ===
            "ok",

        status:
          response.status,

        tiktok: data,
      },
      {
        status:
          response.ok
            ? 200
            : response.status,
      },
    );
  } catch (error) {
    console.error(
      "TIKTOK PUBLISH STATUS ERROR",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de récupérer le statut TikTok.",
      },
      {
        status: 500,
      },
    );
  }
}