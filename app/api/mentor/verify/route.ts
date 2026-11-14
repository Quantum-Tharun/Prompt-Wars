import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;
import {
  COGNITIVE_WEIGHT,
  LearningRoadmapSchema,
  SkillValidationRecordSchema,
} from "@/lib/schemas/domain.schema";
import { getQuestionsCatalogue } from "@/lib/data-loader";
import { completeRemediationRecovery } from "@/lib/engine/adaptation-engine";

const VerifyRemediationRequestSchema = z.object({
  roadmap: LearningRoadmapSchema,
  skillId: z.string(),
  remediationModuleId: z.string(),
  validatedSkills: z.array(SkillValidationRecordSchema),
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
    const parsed = VerifyRemediationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { roadmap, skillId, remediationModuleId, validatedSkills, answers } = parsed.data;

    // Score the verification / recovery quiz
    const allQuestions = getQuestionsCatalogue();
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    let weightedSum = 0;
    let totalWeight = 0;

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      const weight = COGNITIVE_WEIGHT[q.cognitiveTier];
      totalWeight += weight;
      if (ans.selectedIndex === q.correctIndex) {
        weightedSum += weight;
      }
    }

    const recoveryScore =
      totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 100;

    if (recoveryScore < 80) {
      return NextResponse.json(
        {
          success: false,
          passed: false,
          recoveryScore,
          message: `Remediation mastery threshold not met (${recoveryScore}% < 80%). Downstream modules remain locked.`,
        },
        { status: 200 }
      );
    }

    // Complete recovery: mark remediation completed, dynamically unlock downstream React module
    const recoveryResult = completeRemediationRecovery(
      roadmap,
      skillId,
      remediationModuleId,
      validatedSkills
    );

    return NextResponse.json(
      {
        success: true,
        passed: true,
        recoveryScore,
        mutatedRoadmap: recoveryResult.mutatedRoadmap,
        unlockedModules: recoveryResult.unlockedModules,
        updatedValidatedSkills: recoveryResult.updatedValidatedSkills,
        newReadinessScore: recoveryResult.newReadinessScore,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during remediation recovery verification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

