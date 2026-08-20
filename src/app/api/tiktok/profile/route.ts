import { NextRequest, NextResponse } from "next/server";
import { getTikTokUserInfo } from "@/services/tiktok.service";

export async function GET(request: NextRequest) {
  try {
    const accessToken =
      request.cookies.get("tiktok_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          connected: false,
          user: null,
        },
        {
          status: 200,
        }
      );
    }

    const user =
      await getTikTokUserInfo(accessToken);

    return NextResponse.json({
      connected: true,
      user: {
        open_id: user.open_id,
        display_name:
          user.display_name ?? "Compte TikTok",
        avatar_url:
          user.avatar_url ??
          user.avatar_url_100 ??
          user.avatar_large_url ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "TikTok profile error:",
      error
    );

    return NextResponse.json(
      {
        connected: false,
        user: null,
        error:
          "Impossible de récupérer le profil TikTok.",
      },
      {
        status: 200,
      }
    );
  }
}