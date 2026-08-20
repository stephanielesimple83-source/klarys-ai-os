const TIKTOK_AUTHORIZE_URL =
  "https://www.tiktok.com/v2/auth/authorize/";

const TIKTOK_TOKEN_URL =
  "https://open.tiktokapis.com/v2/oauth/token/";

const TIKTOK_USER_INFO_URL =
  "https://open.tiktokapis.com/v2/user/info/";

export const TIKTOK_REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ??
  "https://klarys-ai-os-alpha.vercel.app/api/auth/tiktok/callback";

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.upload",
  "video.publish",
];

export function getTikTokClientKey() {
  const clientKey =
    process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    throw new Error(
      "TIKTOK_CLIENT_KEY is missing.",
    );
  }

  return clientKey;
}

export function getTikTokClientSecret() {
  const clientSecret =
    process.env.TIKTOK_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error(
      "TIKTOK_CLIENT_SECRET is missing.",
    );
  }

  return clientSecret;
}

export function buildTikTokAuthorizeUrl(
  state: string,
) {
  const params =
    new URLSearchParams({
      client_key:
        getTikTokClientKey(),
      response_type:
        "code",
      scope:
        TIKTOK_SCOPES.join(","),
      redirect_uri:
        TIKTOK_REDIRECT_URI,
      state,
    });

  return `${TIKTOK_AUTHORIZE_URL}?${params.toString()}`;
}

export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name?: string;
}

export async function exchangeTikTokCode(
  code: string,
): Promise<TikTokTokenResponse> {
  const body =
    new URLSearchParams({
      client_key:
        getTikTokClientKey(),
      client_secret:
        getTikTokClientSecret(),
      code,
      grant_type:
        "authorization_code",
      redirect_uri:
        TIKTOK_REDIRECT_URI,
    });

  const response =
    await fetch(
      TIKTOK_TOKEN_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          "Cache-Control":
            "no-cache",
        },

        body,

        cache:
          "no-store",
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ??
        data?.error ??
        "TikTok token exchange failed.",
    );
  }

  return data as TikTokTokenResponse;
}

export async function getTikTokUserInfo(
  accessToken: string,
): Promise<TikTokUserInfo> {
  const fields = [
    "open_id",
    "union_id",
    "avatar_url",
    "avatar_url_100",
    "avatar_large_url",
    "display_name",
  ].join(",");

  const response =
    await fetch(
      `${TIKTOK_USER_INFO_URL}?fields=${encodeURIComponent(fields)}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        cache:
          "no-store",
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ??
        data?.error_description ??
        "Impossible de récupérer le profil TikTok.",
    );
  }

  const user =
    data?.data?.user;

  if (!user) {
    throw new Error(
      "Profil TikTok introuvable.",
    );
  }

  return user as TikTokUserInfo;
}