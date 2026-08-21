import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const accessToken =
    request.cookies.get(
      "tiktok_access_token",
    )?.value;

  const refreshToken =
    request.cookies.get(
      "tiktok_refresh_token",
    )?.value;

  const openId =
    request.cookies.get(
      "tiktok_open_id",
    )?.value;

  const connectedCookie =
    request.cookies.get(
      "tiktok_connected",
    )?.value;

  const oauthState =
    request.cookies.get(
      "tiktok_oauth_state",
    )?.value;

  const cookieTest =
    request.cookies.get(
      "tiktok_cookie_test",
    )?.value;

  const cookieNames =
    request.cookies
      .getAll()
      .map((cookie) => cookie.name);

  return NextResponse.json({
    connected: Boolean(
      accessToken &&
        refreshToken &&
        openId,
    ),

    accessTokenPresent:
      Boolean(accessToken),

    refreshTokenPresent:
      Boolean(refreshToken),

    openIdPresent:
      Boolean(openId),

    connectedCookiePresent:
      Boolean(connectedCookie),

    oauthStatePresent:
      Boolean(oauthState),

    cookieTestPresent:
      Boolean(cookieTest),

    cookieNames,

    requestHost:
      request.headers.get("host"),

    forwardedProto:
      request.headers.get(
        "x-forwarded-proto",
      ),
  });
}