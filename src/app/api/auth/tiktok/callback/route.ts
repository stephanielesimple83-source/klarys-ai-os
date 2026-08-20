import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  exchangeTikTokCode,
} from "@/services/tiktok.service";

export const dynamic = "force-dynamic";

const APP_URL =
  "https://klarys-ai-os-alpha.vercel.app";

function redirectWithError(message: string) {
  const url = new URL(
    "/reseaux-sociaux/tiktok",
    APP_URL,
  );

  url.searchParams.set("error", message);

  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
) {
  const code =
    request.nextUrl.searchParams.get("code");

  const state =
    request.nextUrl.searchParams.get("state");

  const error =
    request.nextUrl.searchParams.get("error");

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
      await exchangeTikTokCode(code);

    const url = new URL(
      "/reseaux-sociaux/tiktok",
      APP_URL,
    );

    url.searchParams.set(
      "connected",
      "1",
    );

    const response =
      NextResponse.redirect(url);

    response.cookies.delete(
      "tiktok_oauth_state",
    );

    response.cookies.set(
      "tiktok_access_token",
      tokens.access_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: tokens.expires_in,
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
        maxAge:
          tokens.refresh_expires_in,
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
        maxAge:
          tokens.refresh_expires_in,
      },
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Connexion TikTok impossible.";

    return redirectWithError(message);
  }
}