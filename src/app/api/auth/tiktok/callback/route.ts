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
      errorDescription ??
        error,
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

      console.log("TIKTOK TOKEN DEBUG", {
  hasAccessToken: Boolean(tokens.access_token),
  hasRefreshToken: Boolean(tokens.refresh_token),
  hasOpenId: Boolean(tokens.open_id),
  accessTokenLength:
    tokens.access_token?.length ?? 0,
  refreshTokenLength:
    tokens.refresh_token?.length ?? 0,
  openId:
    tokens.open_id ?? null,
  scope:
    tokens.scope ?? null,
});

    const url = new URL(
      "/reseaux-sociaux/tiktok",
      APP_URL,
    );

    url.searchParams.set(
      "connected",
      "1",
    );

    const response =
      NextResponse.redirect(
        url,
      );

    /*
     * Cookies de session TikTok.
     *
     * Pas de maxAge pour le moment :
     * ils restent actifs pendant
     * la session navigateur.
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

    /*
     * Petit indicateur de connexion.
     * Aucun token n'est exposé.
     */

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