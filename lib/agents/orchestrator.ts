import {
  type AgentTraceEntry,
  type CareerGapMatrix,
  type LearnerBackground,
  type LearningRoadmap,
  type SkillValidationRecord,
} from "../schemas/domain.schema";
import { runSkillAnalyzer, type SkillAnalyzerOutput } from "./skill-analyzer";
import { runCareerGapAnalyst, type CareerGapAgentOutput } from "./career-gap-agent";
import { runLearningPlanner } from "./learning-planner";
import { computeCareerGapMatrix } from "../engine/career-matcher";

export interface OrchestrationResult {
  gapMatrix: CareerGapMatrix;
  roadmap: LearningRoadmap;
  skillAnalysis: SkillAnalyzerOutput;
  gapAnalysis: CareerGapAgentOutput;
  agentTrace: AgentTraceEntry[];
}

export async function runRoadmapOrchestration(
  background: LearnerBackground,
  validatedSkills: SkillValidationRecord[]
): Promise<OrchestrationResult> {
  const agentTrace: AgentTraceEntry[] = [];

  // 1. Run deterministic career gap matrix computation synchronously (<5ms)
  const gapMatrix = computeCareerGapMatrix(
    validatedSkills,
    background.targetCareerId,
    background.weeklyLearningHours
  );

  // 2. Parallel Execution of Agent 1 (Skill Analyzer) and Agent 2 (Career Gap Analyst) via Promise.all
  // We construct an initial gap analysis baseline for Agent 2 so it can execute concurrently with Agent 1
  const baselineSkillAnalysis: SkillAnalyzerOutput = {
    executiveSummary: `Automated baseline assessment across ${validatedSkills.length} skills.`,
    calibrationAnalysis: validatedSkills.map((s) => ({
      skillId: s.skillId,
      diagnosis: `${s.calibrationState} (${s.assessmentScore}%)`,
      rootCause: s.evidenceSummary,
      recommendedAction: `Address weak topics: ${s.weakTopics.map((w) => w.topicTag).join(", ") || "None"}`,
    })),
    verifiedStrengthsSummary: validatedSkills
      .filter((s) => s.validatedLevel !== "none")
      .map((s) => `${s.skillName} (${s.validatedLevel})`)
      .join(", "),
    primaryRiskFactor: validatedSkills.some((s) => s.calibrationState === "overconfident")
      ? "Cognitive calibration gap detected in self-reported skills."
      : "Standard curriculum progression.",
  };

  const [skillAnalyzerResult, careerGapResult] = await Promise.all([
    runSkillAnalyzer(background, validatedSkills),
    runCareerGapAnalyst(background, gapMatrix, baselineSkillAnalysis),
  ]);

  agentTrace.push(skillAnalyzerResult.trace);
  agentTrace.push(careerGapResult.trace);

  // 3. Pass synthesized outputs into Agent 3 (Learning Planner)
  const learningPlannerResult = await runLearningPlanner(
    background,
    gapMatrix,
    careerGapResult.data
  );
  agentTrace.push(learningPlannerResult.trace);

  return {
    gapMatrix,
    roadmap: learningPlannerResult.data,
    skillAnalysis: skillAnalyzerResult.data,
    gapAnalysis: careerGapResult.data,
    agentTrace,
  };
}
