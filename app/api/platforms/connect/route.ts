import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PlatformConsentEnvelopeSchema,
} from "@/lib/schemas/domain.schema";
import {
  processPlatformDiscovery,
  PlatformConsentError,
} from "@/lib/footprint/platform-connector";

const ConnectPlatformsRequestSchema = z.object({
  learnerId: z.string().min(1),
  envelopes: z.array(PlatformConsentEnvelopeSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ConnectPlatformsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { learnerId, envelopes } = parsed.data;

    const footprintResult = await processPlatformDiscovery(learnerId, envelopes);

    return NextResponse.json(
      {
        success: true,
        footprint: footprintResult,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PlatformConsentError) {
      return NextResponse.json(
        {
          error: "PLATFORM_CONSENT_REQUIRED",
          message: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error during platform discovery",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

