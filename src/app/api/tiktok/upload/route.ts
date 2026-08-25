import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  refreshTikTokAccessToken,
  type TikTokTokenResponse,
} from "@/services/tiktok.service";

export const dynamic =
  "force-dynamic";

const TIKTOK_UPLOAD_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";

type TikTokUploadInitResponse = {
  data?: {
    publish_id?: string;
    upload_url?: string;
  };

  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

async function initializeTikTokUpload(
  accessToken: string,
  videoSize: number,
) {
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
    (await response.json()) as
      TikTokUploadInitResponse;

  return {
    response,
    data,
    chunkSize,
    totalChunkCount,
  };
}

function isAccessTokenInvalid(
  status: number,
  data: TikTokUploadInitResponse,
) {
  return (
    status === 401 &&
    data?.error?.code ===
      "access_token_invalid"
  );
}

function applyTikTokCookies(
  response: NextResponse,
  tokens: TikTokTokenResponse,
  fallbackRefreshToken: string,
) {
  response.cookies.set(
    "tiktok_access_token",
    tokens.access_token,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",

      maxAge:
        Number.isFinite(
          tokens.expires_in,
        ) &&
        tokens.expires_in > 0
          ? tokens.expires_in
          : 86400,
    },
  );

  const refreshToken =
    tokens.refresh_token ||
    fallbackRefreshToken;

  if (refreshToken) {
    response.cookies.set(
      "tiktok_refresh_token",
      refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",

        maxAge:
          Number.isFinite(
            tokens.refresh_expires_in,
          ) &&
          tokens.refresh_expires_in >
            0
            ? tokens.refresh_expires_in
            : 31536000,
      },
    );
  }

  if (tokens.open_id) {
    response.cookies.set(
      "tiktok_open_id",
      tokens.open_id,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    );
  }

  response.cookies.set(
    "tiktok_connected",
    "1",
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    },
  );
}

export async function POST(
  request: NextRequest,
) {
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

    let accessToken =
      request.cookies.get(
        "tiktok_access_token",
      )?.value ??
      "";

    const refreshToken =
      request.cookies.get(
        "tiktok_refresh_token",
      )?.value ??
      "";

    let refreshedTokens:
      TikTokTokenResponse | null =
      null;

    /*
     * Si l'access token a déjà disparu
     * du navigateur mais que le refresh
     * token existe encore, on renouvelle
     * le token avant même le premier appel.
     */
    if (
      !accessToken &&
      refreshToken
    ) {
      refreshedTokens =
        await refreshTikTokAccessToken(
          refreshToken,
        );

      accessToken =
        refreshedTokens.access_token;
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,

          error:
            "TikTok non connecté. Reconnecte ton compte TikTok.",
        },
        {
          status: 401,
        },
      );
    }

    let result =
      await initializeTikTokUpload(
        accessToken,
        videoSize,
      );

    /*
     * TikTok recommande de rafraîchir
     * le token puis de réessayer lorsque
     * l'API renvoie access_token_invalid.
     */
    if (
      isAccessTokenInvalid(
        result.response.status,
        result.data,
      )
    ) {
      if (!refreshToken) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Le token TikTok a expiré et aucun refresh token n'est disponible. Reconnecte ton compte TikTok.",

            status:
              result.response.status,

            tiktok:
              result.data,
          },
          {
            status: 401,
          },
        );
      }

      refreshedTokens =
        await refreshTikTokAccessToken(
          refreshToken,
        );

      accessToken =
        refreshedTokens.access_token;

      /*
       * Une seule nouvelle tentative
       * avec le nouvel access token.
       */
      result =
        await initializeTikTokUpload(
          accessToken,
          videoSize,
        );
    }

    if (
      !result.response.ok ||
      result.data?.error?.code !==
        "ok"
    ) {
      const errorCode =
        result.data?.error?.code ??
        "unknown";

      const errorMessage =
        result.data?.error?.message ??
        "TikTok a refusé l'initialisation de l'envoi.";

      const logId =
        result.data?.error?.log_id ??
        null;

      const errorResponse =
        NextResponse.json(
          {
            success: false,

            status:
              result.response.status,

            error:
              `TikTok ${errorCode} — ${errorMessage}`,

            logId,

            tiktok:
              result.data,
          },
          {
            status:
              result.response.ok
                ? 400
                : result.response.status,
          },
        );

      if (refreshedTokens) {
        applyTikTokCookies(
          errorResponse,
          refreshedTokens,
          refreshToken,
        );
      }

      return errorResponse;
    }

    const publishId =
      result.data?.data
        ?.publish_id;

    const uploadUrl =
      result.data?.data
        ?.upload_url;

    if (
      !publishId ||
      !uploadUrl
    ) {
      const errorResponse =
        NextResponse.json(
          {
            success: false,

            error:
              "TikTok n'a pas retourné de publish_id ou upload_url.",

            tiktok:
              result.data,
          },
          {
            status: 502,
          },
        );

      if (refreshedTokens) {
        applyTikTokCookies(
          errorResponse,
          refreshedTokens,
          refreshToken,
        );
      }

      return errorResponse;
    }

    const successResponse =
      NextResponse.json({
        success: true,

        publishId,

        uploadUrl,

        videoSize,

        chunkSize:
          result.chunkSize,

        totalChunkCount:
          result.totalChunkCount,

        tokenRefreshed:
          Boolean(
            refreshedTokens,
          ),
      });

    if (refreshedTokens) {
      applyTikTokCookies(
        successResponse,
        refreshedTokens,
        refreshToken,
      );
    }

    return successResponse;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "TIKTOK UPLOAD INIT ERROR",
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