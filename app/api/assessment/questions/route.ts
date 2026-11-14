import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SelfReportedSkillClaimSchema,
  type CareerId,
} from "@/lib/schemas/domain.schema";
import {
  generateAdaptiveStaircase,
  stripAnswerKeys,
} from "@/lib/assessment/question-engine";

const QuestionsRequestSchema = z.object({
  claims: z.array(SelfReportedSkillClaimSchema),
  targetCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = QuestionsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { claims, targetCareerId } = parsed.data;

    const staircase = generateAdaptiveStaircase(claims, targetCareerId as CareerId);

    const clientQuestionsBySkill: Record<string, ReturnType<typeof stripAnswerKeys>> = {};
    for (const [skillId, questions] of Object.entries(staircase.questionsBySkill)) {
      clientQuestionsBySkill[skillId] = stripAnswerKeys(questions);
    }

    return NextResponse.json(
      {
        success: true,
        targetCareerId,
        totalQuestions: staircase.allQuestions.length,
        questionsBySkill: clientQuestionsBySkill,
        allQuestions: stripAnswerKeys(staircase.allQuestions),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during question generation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

