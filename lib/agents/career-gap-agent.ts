import { z } from "zod";
import {
  type CareerGapMatrix,
  type LearnerBackground,
} from "../schemas/domain.schema";
import { type SkillAnalyzerOutput } from "./skill-analyzer";
import { executeAgentWithFallback, type AgentExecutionResult } from "../ai/gemini";

export const CareerGapAgentOutputSchema = z.object({
  readinessNarrative: z.string(),
  criticalPathBottlenecks: z.array(z.string()),
  employabilityRisks: z.array(z.string()),
  sequencingStrategy: z.string(),
});
export type CareerGapAgentOutput = z.infer<typeof CareerGapAgentOutputSchema>;

export async function runCareerGapAnalyst(
  background: LearnerBackground,
  gapMatrix: CareerGapMatrix,
  skillAnalysis: SkillAnalyzerOutput
): Promise<AgentExecutionResult<CareerGapAgentOutput>> {
  const systemPrompt = `You are the Career Gap Analyst (Agent 2) in the SkillPath AI architecture.
Your mission is to evaluate a learner's empirical Career Gap Matrix and provide strategic employability analysis.
Explain how specific prerequisite deficiencies form critical path bottlenecks blocking core market competencies.
Always formulate technical sequencing rationale (e.g. why foundational language closures/async must precede UI state management or microservices).
Output strictly in JSON conforming to the schema.`;

  const userPrompt = `Learner Profile:
Name: ${background.name}
Target Career: ${gapMatrix.targetCareerTitle} (${gapMatrix.targetCareerId})
Weekly Available Hours: ${background.weeklyLearningHours}

Career Gap Matrix:
${JSON.stringify(gapMatrix, null, 2)}

Skill Analyzer Diagnostic Insights:
${JSON.stringify(skillAnalysis, null, 2)}

Provide strategic gap diagnosis, bottleneck identification, employability risk analysis, and sequencing strategy.`;

  const deterministicFallback = (): CareerGapAgentOutput => {
    const bottlenecks = [
      ...gapMatrix.improvementsNeeded.map(
        (item) =>
          `Deficit in ${item.skillName} (Current: ${item.currentValidatedLevel}, Required: ${item.requiredLevel}). Missing critical topics: [${item.missingCriticalTopics.join(", ")}]. Priority Score: ${item.priorityScore}.`
      ),
      ...gapMatrix.newLearningNeeded.map(
        (item) =>
          `Missing Core Competency: ${item.skillName} (Required: ${item.requiredLevel}, Weight: ${item.weight}). Requires full curriculum progression.`
      ),
    ];

    const risks: string[] = [];
    if (gapMatrix.overallReadinessScore < 50) {
      risks.push(
        `High Early-Stage Risk: Overall readiness stands at ${gapMatrix.overallReadinessScore}%. Learner is not yet interview-ready for ${gapMatrix.targetCareerTitle}.`
      );
    }
    if (gapMatrix.improvementsNeeded.length > 0) {
      const topImprovement = gapMatrix.improvementsNeeded[0];
      risks.push(
        `Technical Foundation Risk: Premature exposure to higher-order frameworks before resolving ${topImprovement.skillName} deficiencies will cause compounding blockers.`
      );
    }
    if (gapMatrix.newLearningNeeded.length > 0) {
      risks.push(
        `Curriculum Breadth Risk: ${gapMatrix.newLearningNeeded.length} core domain competencies have 0% verified coverage, necessitating ~${gapMatrix.estimatedTotalHoursToReady} structured hours.`
      );
    }

    const sequencing =
      `Phase 1: Remediate calibration gaps and reinforce core foundational skills (${gapMatrix.improvementsNeeded.map((s) => s.skillName).join(", ") || "None"}). ` +
      `Phase 2: Master unassessed language and query engines. ` +
      `Phase 3: Synthesize client/server frameworks. ` +
      `Phase 4: Integrate distributed API architecture and advanced tooling. ` +
      `Phase 5: Deploy full-stack production capstone portfolio.`;

    return {
      readinessNarrative: `${background.name} currently demonstrates a ${gapMatrix.overallReadinessScore}% weighted readiness match for ${gapMatrix.targetCareerTitle}. Estimated effort to job-readiness is ${gapMatrix.estimatedTotalHoursToReady} hours (~${gapMatrix.estimatedWeeksToReady} weeks at ${background.weeklyLearningHours} hrs/week).`,
      criticalPathBottlenecks:
        bottlenecks.length > 0
          ? bottlenecks
          : ["No critical bottlenecks detected; existing capabilities meet initial career prerequisites."],
      employabilityRisks:
        risks.length > 0
          ? risks
          : ["Low baseline risk; maintain project cadence and architectural portfolio."],
      sequencingStrategy: sequencing,
    };
  };

  return executeAgentWithFallback<CareerGapAgentOutput>({
    agentName: "CareerGapAnalyst",
    systemPrompt,
    userPrompt,
    zodSchema: CareerGapAgentOutputSchema,
    deterministicFallback,
    extractKeyFindings: (data) => [
      data.readinessNarrative,
      ...data.criticalPathBottlenecks.slice(0, 2),
      data.sequencingStrategy,
    ],
    inputSummary: `Evaluated career gap for ${gapMatrix.targetCareerTitle}: readiness ${gapMatrix.overallReadinessScore}%, ${gapMatrix.estimatedWeeksToReady} weeks to job readiness.`,
  });
}

