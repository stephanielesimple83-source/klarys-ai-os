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

    /*
     * Diagnostic sécurisé :
     * uniquement les NOMS
     * des propriétés reçues.
     *
     * Aucune valeur de token
     * n'est exposée.
     */
    const rootKeys =
      tokens &&
      typeof tokens === "object"
        ? Object.keys(tokens)
        : [];

    const rawTokens =
      tokens as unknown as Record<
        string,
        unknown
      >;

    const possibleData =
      rawTokens?.data;

    const dataKeys =
      possibleData &&
      typeof possibleData ===
        "object" &&
      !Array.isArray(possibleData)
        ? Object.keys(
            possibleData as Record<
              string,
              unknown
            >,
          )
        : [];

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

        rootKeys,
        dataKeys,

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
     * 111 =
     * access_token présent
     * refresh_token présent
     * open_id présent
     */
    url.searchParams.set(
      "token_debug",
      `${hasAccessToken ? "1" : "0"}${hasRefreshToken ? "1" : "0"}${hasOpenId ? "1" : "0"}`,
    );

    /*
     * Diagnostic temporaire.
     *
     * On affiche uniquement
     * les noms des champs.
     */
    url.searchParams.set(
      "root_keys",
      rootKeys.join(",") ||
        "none",
    );

    url.searchParams.set(
      "data_keys",
      dataKeys.join(",") ||
        "none",
    );

    const response =
      NextResponse.redirect(
        url,
      );

    /*
     * Cookie témoin créé depuis
     * le callback OAuth.
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
    if (tokens.access_token) {
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
    }

    if (tokens.refresh_token) {
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

    if (
      hasAccessToken &&
      hasRefreshToken &&
      hasOpenId
    ) {
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