import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const RUNWAY_API_VERSION =
  "2024-11-06";

export async function POST(
  request: NextRequest,
) {
  try {
    const apiKey =
      process.env.RUNWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La clé API Runway n'est pas configurée.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      await request.json();

    const taskId =
      typeof body?.taskId ===
      "string"
        ? body.taskId.trim()
        : "";

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "taskId est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const response =
      await fetch(
        `https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(
          taskId,
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "X-Runway-Version":
              RUNWAY_API_VERSION,
          },

          cache: "no-store",
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
          error:
            data?.message ??
            data?.error ??
            "Impossible de récupérer le statut Runway.",
          runway:
            data,
        },
        {
          status:
            response.status,
        },
      );
    }

    const status =
      data?.status ??
      "UNKNOWN";

    const output =
      Array.isArray(
        data?.output,
      )
        ? data.output
        : [];

    const videoUrl =
      typeof output?.[0] ===
      "string"
        ? output[0]
        : null;

    return NextResponse.json({
      success: true,

      taskId,

      status,

      videoUrl,

      runway:
        data,
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