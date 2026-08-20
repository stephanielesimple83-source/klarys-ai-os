const TIKTOK_AUTHORIZE_URL =
  "https://www.tiktok.com/v2/auth/authorize/";

const TIKTOK_TOKEN_URL =
  "https://open.tiktokapis.com/v2/oauth/token/";

export const TIKTOK_REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ??
  "https://klarys-ai-os-alpha.vercel.app/api/auth/tiktok/callback";

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.upload",
  "video.publish",
];

export function getTikTokClientKey() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    throw new Error("TIKTOK_CLIENT_KEY is missing.");
  }

  return clientKey;
}

export function getTikTokClientSecret() {
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("TIKTOK_CLIENT_SECRET is missing.");
  }

  return clientSecret;
}

export function buildTikTokAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_key: getTikTokClientKey(),
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    redirect_uri: TIKTOK_REDIRECT_URI,
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

export async function exchangeTikTokCode(
  code: string,
): Promise<TikTokTokenResponse> {
  const body = new URLSearchParams({
    client_key: getTikTokClientKey(),
    client_secret: getTikTokClientSecret(),
    code,
    grant_type: "authorization_code",
    redirect_uri: TIKTOK_REDIRECT_URI,
  });

  const response = await fetch(
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

      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ??
        data?.error ??
        "TikTok token exchange failed.",
    );
  }

  return data as TikTokTokenResponse;
}