import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;
import {
  LearnerBackgroundSchema,
  SkillValidationRecordSchema,
  type CareerId,
} from "@/lib/schemas/domain.schema";
import { computeCareerPivot } from "@/lib/engine/career-matcher";
import { runRoadmapOrchestration } from "@/lib/agents/orchestrator";

const PivotRequestSchema = z.object({
  background: LearnerBackgroundSchema,
  validatedSkills: z.array(SkillValidationRecordSchema),
  oldCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
  newCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PivotRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { background, validatedSkills, oldCareerId, newCareerId } = parsed.data;

    // 1. Compute zero-loss skill transfer and identify contextual bridge requirements
    const pivotResult = computeCareerPivot(
      validatedSkills,
      oldCareerId as CareerId,
      newCareerId as CareerId,
      background.weeklyLearningHours
    );

    // 2. Synthesize updated learning roadmap for the new career trajectory
    const updatedBackground = {
      ...background,
      targetCareerId: newCareerId as CareerId,
    };

    const orchestrationResult = await runRoadmapOrchestration(
      updatedBackground,
      validatedSkills
    );

    // Calculate preserved hours capital
    const hoursSaved = pivotResult.transferredSkills.reduce((acc, s) => {
      // 15 hours saved per intermediate, 25 per advanced
      return acc + (s.validatedLevel === "advanced" ? 25 : 15);
    }, 0);

    const skillCapitalLedger = {
      hoursSaved,
      transferredSkillNames: pivotResult.transferredSkills.map((s) => s.skillName),
      contextualBridgeCount: pivotResult.contextualBridgeSkills.length,
      netNewGapsCount: pivotResult.unassessedNewSkills.length,
    };

    return NextResponse.json(
      {
        success: true,
        oldCareerId,
        newCareerId,
        pivotResult,
        skillCapitalLedger,
        newRoadmap: orchestrationResult.roadmap,
        gapAnalysis: orchestrationResult.gapAnalysis,
        agentTrace: orchestrationResult.agentTrace,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during career pivot",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
