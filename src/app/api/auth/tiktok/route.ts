import { NextRequest, NextResponse } from "next/server";
import {
  exchangeTikTokCode,
  getTikTokUserInfo,
} from "@/services/tiktok.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          "/reseaux-sociaux/tiktok?error=tiktok_authorization",
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/reseaux-sociaux/tiktok?error=missing_code",
          request.url
        )
      );
    }

    const token = await exchangeTikTokCode(code);

    const user = await getTikTokUserInfo(
      token.access_token
    );

    const response = NextResponse.redirect(
      new URL(
        "/reseaux-sociaux/tiktok?connected=1",
        request.url
      )
    );

    response.cookies.set(
      "tiktok_access_token",
      token.access_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: token.expires_in,
        path: "/",
      }
    );

    response.cookies.set(
      "tiktok_refresh_token",
      token.refresh_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: token.refresh_expires_in,
        path: "/",
      }
    );

    response.cookies.set(
      "tiktok_user",
      JSON.stringify({
        open_id: user.open_id,
        display_name: user.display_name ?? "",
        avatar_url: user.avatar_url ?? "",
      }),
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: token.expires_in,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("TikTok callback error:", error);

    return NextResponse.redirect(
      new URL(
        "/reseaux-sociaux/tiktok?error=callback_failed",
        request.url
      )
    );
  }
}