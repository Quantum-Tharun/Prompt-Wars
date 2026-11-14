import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;
import {
  LearnerBackgroundSchema,
  SelfReportedSkillClaimSchema,
} from "@/lib/schemas/domain.schema";
import { scoreSkillAssessment } from "@/lib/assessment/scoring-engine";
import { runRoadmapOrchestration } from "@/lib/agents/orchestrator";

const OrchestrateRequestSchema = z.object({
  background: LearnerBackgroundSchema,
  claims: z.array(SelfReportedSkillClaimSchema),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(0).max(3),
      timeSpentMs: z.number().optional(),
    })
  ),
  platformSignals: z
    .record(
      z.string(),
      z.object({
        repoCount: z.number().optional(),
        certCount: z.number().optional(),
        evidenceSource: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = OrchestrateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { background, claims, answers, platformSignals } = parsed.data;

    // 1. Deterministic cognitive grading & 3-Vector Triangulation
    const validatedSkills = scoreSkillAssessment(claims, answers, platformSignals);

    // 2. Parallelized Agent Orchestrator:
    // Gap Matrix -> Promise.all(Agent 1, Agent 2) -> Agent 3 -> Provenance-attached Roadmap
    const orchestrationResult = await runRoadmapOrchestration(
      background,
      validatedSkills
    );

    return NextResponse.json(
      {
        success: true,
        validatedSkills,
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
        error: "Internal server error during pipeline orchestration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

