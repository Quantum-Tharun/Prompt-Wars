import { NextResponse } from "next/server";
import { z } from "zod";
import {
  LearnerBackgroundSchema,
  SkillValidationRecordSchema,
} from "@/lib/schemas/domain.schema";
import { runRoadmapOrchestration } from "@/lib/agents/orchestrator";

const GenerateRoadmapRequestSchema = z.object({
  background: LearnerBackgroundSchema,
  validatedSkills: z.array(SkillValidationRecordSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = GenerateRoadmapRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { background, validatedSkills } = parsed.data;

    // Orchestrator executes deterministic Career Gap Matcher + Agent 1 -> Agent 2 -> Agent 3
    const orchestrationResult = await runRoadmapOrchestration(
      background,
      validatedSkills
    );

    return NextResponse.json(
      {
        success: true,
        gapMatrix: orchestrationResult.gapMatrix,
        roadmap: orchestrationResult.roadmap,
        skillAnalysis: orchestrationResult.skillAnalysis,
        gapAnalysis: orchestrationResult.gapAnalysis,
        agentTrace: orchestrationResult.agentTrace,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during roadmap generation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

