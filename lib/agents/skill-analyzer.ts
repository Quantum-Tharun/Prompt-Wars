import { z } from "zod";
import {
  type LearnerBackground,
  type SkillValidationRecord,
} from "../schemas/domain.schema";
import { executeAgentWithFallback, type AgentExecutionResult } from "../ai/gemini";

export const SkillAnalyzerOutputSchema = z.object({
  executiveSummary: z.string(),
  calibrationAnalysis: z.array(
    z.object({
      skillId: z.string(),
      diagnosis: z.string(),
      rootCause: z.string(),
      recommendedAction: z.string(),
    })
  ),
  verifiedStrengthsSummary: z.string(),
  primaryRiskFactor: z.string(),
});
export type SkillAnalyzerOutput = z.infer<typeof SkillAnalyzerOutputSchema>;

export async function runSkillAnalyzer(
  background: LearnerBackground,
  validatedSkills: SkillValidationRecord[]
): Promise<AgentExecutionResult<SkillAnalyzerOutput>> {
  const systemPrompt = `You are the Skill Analyzer (Agent 1) in the SkillPath AI architecture.
Your mission is to perform deep cognitive tier and calibration diagnostics on a learner's self-reported vs. empirically validated skills.
Analyze calibration deltas:
- Overconfident (Claimed > Validated): "Illusion of Competence", where familiarity with basic syntax masks weak algorithmic tracing or debugging.
- Calibrated (Claimed == Validated): Stable, grounded baseline.
- Underconfident (Validated > Claimed): "Hidden Strength", where the learner possesses unacknowledged competence.

Output JSON conforming strictly to the requested schema. Provide rigorous, specific technical explanations referencing micro-topic tags.`;

  const userPrompt = `Learner Profile:
Name: ${background.name}
Target Career: ${background.targetCareerId}
Weekly Hours: ${background.weeklyLearningHours}
Field: ${background.fieldOfStudy}

Empirical Skill Validation Records:
${JSON.stringify(validatedSkills, null, 2)}

Produce a comprehensive cognitive and calibration diagnosis.`;

  const deterministicFallback = (): SkillAnalyzerOutput => {
    const overconfident = validatedSkills.filter((s) => s.calibrationState === "overconfident");
    const calibrated = validatedSkills.filter((s) => s.calibrationState === "calibrated");
    const underconfident = validatedSkills.filter((s) => s.calibrationState === "underconfident");

    const calibrationAnalysis = validatedSkills.map((s) => {
      const weakTags = s.weakTopics.map((w) => w.topicTag).join(", ");
      const verifiedTags = s.verifiedTopics.join(", ");

      if (s.calibrationState === "overconfident") {
        return {
          skillId: s.skillId,
          diagnosis: `Illusion of Competence in ${s.skillName}. Self-reported ${s.selfReportedLevel} vs. validated ${s.validatedLevel} (${s.assessmentScore}% score).`,
          rootCause: `Familiarity with basic syntax creates false confidence, but failed cognitive tracing on deeper concepts: [${weakTags || "complex queries/logic"}].`,
          recommendedAction: `Prioritize surgical remediation in Phase 1 for [${weakTags}] before advancing to higher-level dependencies.`,
        };
      }

      if (s.calibrationState === "underconfident") {
        return {
          skillId: s.skillId,
          diagnosis: `Hidden Strength in ${s.skillName}. Validated at ${s.validatedLevel} exceeding self-reported ${s.selfReportedLevel}.`,
          rootCause: `Solid underlying mechanics and problem-solving demonstrated across [${verifiedTags}].`,
          recommendedAction: `Accelerate directly into intermediate-to-advanced project synthesis.`,
        };
      }

      return {
        skillId: s.skillId,
        diagnosis: `Accurately Calibrated in ${s.skillName} at ${s.validatedLevel} (${s.assessmentScore}% score).`,
        rootCause: `Consistent execution across tested micro-topics [${verifiedTags}], aligning self-perception with diagnostic proof.`,
        recommendedAction: `Maintain regular practice and systematically progress to downstream topics.`,
      };
    });

    const strengthsList = calibrated
      .concat(underconfident)
      .map((s) => `${s.skillName} (${s.validatedLevel})`)
      .join(", ");

    const riskDescriptions = overconfident.map(
      (s) =>
        `${s.skillName} deficit (validated ${s.validatedLevel} vs claimed ${s.selfReportedLevel}; failed ${s.weakTopics.map((w) => w.topicTag).join(", ")})`
    );

    const primaryRisk =
      riskDescriptions.length > 0
        ? `Cognitive calibration gap in ${riskDescriptions.join("; ")}.`
        : "No severe calibration anomalies detected.";

    return {
      executiveSummary: `Diagnostic evaluation for ${background.name} targeting ${background.targetCareerId}. Verified ${validatedSkills.length} skill claim(s). Identified ${overconfident.length} overconfident area(s), ${calibrated.length} calibrated area(s), and ${underconfident.length} underconfident area(s).`,
      calibrationAnalysis,
      verifiedStrengthsSummary: strengthsList
        ? `Verified empirical competencies in: ${strengthsList}.`
        : "Foundational competencies require further validation.",
      primaryRiskFactor: primaryRisk,
    };
  };

  return executeAgentWithFallback<SkillAnalyzerOutput>({
    agentName: "SkillAnalyzer",
    systemPrompt,
    userPrompt,
    zodSchema: SkillAnalyzerOutputSchema,
    deterministicFallback,
    extractKeyFindings: (data) => [
      data.executiveSummary,
      `Primary Risk: ${data.primaryRiskFactor}`,
      ...data.calibrationAnalysis.map((c) => `${c.skillId}: ${c.diagnosis}`),
    ],
    inputSummary: `Analyzed ${validatedSkills.length} validated skills for learner ${background.name} (${background.targetCareerId}).`,
  });
}

