import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  exchangeTikTokCode,
} from "@/services/tiktok.service";

export const dynamic =
  "force-dynamic";

const APP_URL =
  "https://klarys-ai-os-alpha.vercel.app";

function redirectWithError(
  message: string,
) {
  const url = new URL(
    "/reseaux-sociaux/tiktok",
    APP_URL,
  );

  url.searchParams.set(
    "error",
    message,
  );

  return NextResponse.redirect(
    url,
  );
}

export async function GET(
  request: NextRequest,
) {
  const code =
    request.nextUrl.searchParams.get(
      "code",
    );

  const state =
    request.nextUrl.searchParams.get(
      "state",
    );

  const error =
    request.nextUrl.searchParams.get(
      "error",
    );

  const errorDescription =
    request.nextUrl.searchParams.get(
      "error_description",
    );

  if (error) {
    return redirectWithError(
      errorDescription ?? error,
    );
  }

  const expectedState =
    request.cookies.get(
      "tiktok_oauth_state",
    )?.value;

  if (
    !state ||
    !expectedState ||
    state !== expectedState
  ) {
    return redirectWithError(
      "État OAuth TikTok invalide.",
    );
  }

  if (!code) {
    return redirectWithError(
      "TikTok n'a pas retourné de code d'autorisation.",
    );
  }

  try {
    const tokens =
      await exchangeTikTokCode(
        code,
      );

    const hasAccessToken =
      Boolean(
        tokens.access_token,
      );

    const hasRefreshToken =
      Boolean(
        tokens.refresh_token,
      );

    const hasOpenId =
      Boolean(
        tokens.open_id,
      );

    console.log(
      "TIKTOK TOKEN DEBUG",
      {
        hasAccessToken,
        hasRefreshToken,
        hasOpenId,

        accessTokenLength:
          tokens.access_token
            ?.length ?? 0,

        refreshTokenLength:
          tokens.refresh_token
            ?.length ?? 0,

        openIdLength:
          tokens.open_id
            ?.length ?? 0,

        scope:
          tokens.scope ?? null,
      },
    );

    const url = new URL(
      "/reseaux-sociaux/tiktok",
      APP_URL,
    );

    url.searchParams.set(
      "connected",
      "1",
    );

    /*
     * 111 signifie :
     *
     * access_token présent
     * refresh_token présent
     * open_id présent
     */
    url.searchParams.set(
      "token_debug",
      `${hasAccessToken ? "1" : "0"}${hasRefreshToken ? "1" : "0"}${hasOpenId ? "1" : "0"}`,
    );

    const response =
      NextResponse.redirect(
        url,
      );

    /*
     * Cookie témoin du callback.
     */
    response.cookies.set(
      "tiktok_callback_test",
      "1",
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    );

    /*
     * Cookies TikTok.
     */
    response.cookies.set(
      "tiktok_access_token",
      tokens.access_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    );

    response.cookies.set(
      "tiktok_refresh_token",
      tokens.refresh_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    );

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

    response.cookies.delete(
      "tiktok_oauth_state",
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Connexion TikTok impossible.";

    return redirectWithError(
      message,
    );
  }
}