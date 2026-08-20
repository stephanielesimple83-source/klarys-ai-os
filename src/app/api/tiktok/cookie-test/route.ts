import {
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  const response =
    NextResponse.redirect(
      new URL(
        "/api/tiktok/status",
        "https://klarys-ai-os-alpha.vercel.app",
      ),
    );

  response.cookies.set(
    "tiktok_cookie_test",
    "1",
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    },
  );

  return response;
}