import { NextResponse } from "next/server";
import { z } from "zod";
import {
  LearnerBackgroundSchema,
  SelfReportedSkillClaimSchema,
} from "@/lib/schemas/domain.schema";
import { scoreSkillAssessment } from "@/lib/assessment/scoring-engine";
import { runSkillAnalyzer } from "@/lib/agents/skill-analyzer";

const ValidateRequestSchema = z.object({
  background: LearnerBackgroundSchema,
  claims: z.array(SelfReportedSkillClaimSchema),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0).max(3),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ValidateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { background, claims, answers } = parsed.data;

    // 1. Deterministic cognitive scoring & calibration computation
    const validatedSkills = scoreSkillAssessment(claims, answers);

    // 2. Run Agent 1 (Skill Analyzer) for qualitative diagnosis & root cause analysis
    const analyzerResult = await runSkillAnalyzer(background, validatedSkills);

    return NextResponse.json(
      {
        success: true,
        learnerId: background.learnerId,
        validatedSkills,
        skillAnalysis: analyzerResult.data,
        agentTrace: [analyzerResult.trace],
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during skill validation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

