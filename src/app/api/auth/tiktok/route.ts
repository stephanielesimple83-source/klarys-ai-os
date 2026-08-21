import { NextResponse } from "next/server";

import {
  buildTikTokAuthorizeUrl,
  getTikTokClientKey,
} from "@/services/tiktok.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = crypto.randomUUID();

  const clientKey =
    getTikTokClientKey();

  const maskedClientKey =
    clientKey.length >= 8
      ? `${clientKey.slice(0, 4)}...${clientKey.slice(-4)}`
      : "too-short";

  console.log(
    "TIKTOK CLIENT KEY DEBUG",
    {
      maskedClientKey,
      length: clientKey.length,
    },
  );

  const authorizeUrl =
    buildTikTokAuthorizeUrl(state);

  const url =
    new URL(authorizeUrl);

  url.searchParams.set(
    "debug_key",
    maskedClientKey,
  );

  const response =
    NextResponse.redirect(
      url,
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