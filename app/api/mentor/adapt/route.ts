import { NextResponse } from "next/server";
import { z } from "zod";
import {
  COGNITIVE_WEIGHT,
  LearningRoadmapSchema,
  type WeakTopicRecord,
} from "@/lib/schemas/domain.schema";
import { getQuestionsCatalogue } from "@/lib/data-loader";
import { applySurgicalRemediation } from "@/lib/engine/adaptation-engine";
import { runAdaptiveMentor } from "@/lib/agents/adaptive-mentor";

const AdaptRequestSchema = z.object({
  roadmap: LearningRoadmapSchema,
  skillId: z.string(),
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
    const parsed = AdaptRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { roadmap, skillId, answers } = parsed.data;

    // 1. Score the checkpoint quiz
    const allQuestions = getQuestionsCatalogue();
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    let weightedSum = 0;
    let totalWeight = 0;
    const failedWeakTopics: WeakTopicRecord[] = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const weight = COGNITIVE_WEIGHT[q.cognitiveTier];
      totalWeight += weight;

      if (ans.selectedIndex === q.correctIndex) {
        weightedSum += weight;
      } else {
        failedWeakTopics.push({
          topicTag: q.topicTag,
          failedCognitiveTier: q.cognitiveTier,
          questionId: q.id,
        });
      }
    }

    const quizScore =
      totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    // 2. Deterministic DAG mutation (surgical remediation node splicing)
    const { mutatedRoadmap, insertedModule } = applySurgicalRemediation(
      roadmap,
      skillId,
      quizScore,
      failedWeakTopics
    );

    // 3. Invoke Agent 4 (Adaptive AI Mentor)
    const mentorResult = await runAdaptiveMentor(
      skillId,
      quizScore,
      failedWeakTopics,
      mutatedRoadmap,
      insertedModule
    );

    return NextResponse.json(
      {
        success: true,
        quizScore,
        passed: quizScore >= 60,
        failedTopics: failedWeakTopics,
        mutatedRoadmap,
        insertedModule,
        mentorGuidance: mentorResult.data,
        agentTrace: [mentorResult.trace],
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error during adaptive remediation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

