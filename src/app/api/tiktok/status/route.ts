import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

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

  return NextResponse.json({
    connected:
      Boolean(accessToken),

    accessTokenPresent:
      Boolean(accessToken),

    refreshTokenPresent:
      Boolean(refreshToken),

    openIdPresent:
      Boolean(openId),
  });
}