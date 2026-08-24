import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";

import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as HandleUploadBody;

    const response =
      await handleUpload({
        body,
        request,

        onBeforeGenerateToken:
          async (
            pathname,
          ) => {
            const lowerPathname =
              pathname.toLowerCase();

            const allowed =
              lowerPathname.endsWith(
                ".mp4",
              ) ||
              lowerPathname.endsWith(
                ".mov",
              ) ||
              lowerPathname.endsWith(
                ".webm",
              );

            if (!allowed) {
              throw new Error(
                "Format vidéo non autorisé.",
              );
            }

            return {
              allowedContentTypes: [
                "video/mp4",
                "video/quicktime",
                "video/webm",
              ],

              maximumSizeInBytes:
                200 *
                1024 *
                1024,

              addRandomSuffix:
                true,
            };
          },

        onUploadCompleted:
          async ({
            blob,
          }) => {
            console.log(
              "TIKTOK VIDEO BLOB UPLOAD COMPLETED",
              {
                pathname:
                  blob.pathname,

                url:
                  blob.url,
              },
            );
          },
      });

    return NextResponse.json(
      response,
    );
  } catch (error) {
    console.error(
      "TIKTOK VIDEO UPLOAD ERROR",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la vidéo vers le stockage.",
      },
      {
        status: 400,
      },
    );
  }
}