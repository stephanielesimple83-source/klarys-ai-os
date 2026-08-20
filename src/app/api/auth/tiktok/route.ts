import { NextResponse } from "next/server";

import {
  buildTikTokAuthorizeUrl,
} from "@/services/tiktok.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = crypto.randomUUID();

  const response = NextResponse.redirect(
    buildTikTokAuthorizeUrl(state),
  );

  response.cookies.set(
    "tiktok_oauth_state",
    state,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    },
  );

  return response;
}