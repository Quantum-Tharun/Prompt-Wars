import { NextResponse } from "next/server";
import { z } from "zod";
import {
  LearnerBackgroundSchema,
  SelfReportedSkillClaimSchema,
  PROFICIENCY_RANK,
  type SkillValidationRecord,
} from "@/lib/schemas/domain.schema";
import { getSkillById } from "@/lib/data-loader";

const InitRequestSchema = z.object({
  background: LearnerBackgroundSchema,
  claims: z.array(SelfReportedSkillClaimSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { background, claims } = parsed.data;

    // Initialize initial unverified skill records
    const unverifiedSkills: SkillValidationRecord[] = claims.map((claim) => {
      const skill = getSkillById(claim.skillId);
      const skillName = skill?.name || claim.skillId;
      const claimedRank = PROFICIENCY_RANK[claim.claimedLevel];

      return {
        skillId: claim.skillId,
        skillName,
        selfReportedLevel: claim.claimedLevel,
        validatedLevel: "none",
        assessmentScore: 0,
        calibrationState: "unverified",
        calibrationDelta: 0 - claimedRank,
        confidence: "low",
        triangulatedArchetype: "unverified_claim",
        questionsAttempted: 0,
        verifiedTopics: [],
        weakTopics: [],
        evidenceSummary: `Self-reported ${claim.claimedLevel} proficiency in ${skillName}. Pending empirical diagnostic validation.`,
        platformEvidence: [],
        rapidGuessDetected: false,
      };
    });

    return NextResponse.json(
      {
        success: true,
        learnerId: background.learnerId,
        profile: background,
        unverifiedSkills,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during discovery initialization",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

