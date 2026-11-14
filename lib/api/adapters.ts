import {
  type SkillValidationRecord,
  type LearningRoadmap,
  type CareerGapMatrix,
  type QuestionItem,
  type AgentTraceEntry,
  type StagedCandidateSkill,
  type PlatformFootprintResult,
} from "@/lib/schemas/domain.schema";

export interface OrchestrationResponse {
  success: boolean;
  validatedSkills: SkillValidationRecord[];
  gapMatrix: CareerGapMatrix;
  roadmap: LearningRoadmap;
  skillAnalysis?: unknown;
  gapAnalysis?: unknown;
  agentTrace: AgentTraceEntry[];
}

export interface AdaptCheckpointResponse {
  success: boolean;
  quizScore: number;
  failedWeakTopics: {
    topicTag: string;
    failedCognitiveTier: string;
    questionId: string;
  }[];
  mutatedRoadmap: LearningRoadmap;
  insertedModule: LearningRoadmap["modules"][0] | null;
  mentorCoaching: {
    diagnosisHeadline: string;
    conceptBreakdowns: {
      topicTag: string;
      whyItMatters: string;
      mentalModelTip: string;
    }[];
    roadmapMutationExplanation: string;
    nextImmediateStep: string;
  };
  agentTrace: AgentTraceEntry[];
}

export interface VerifyRecoveryResponse {
  success: boolean;
  recoveryScore: number;
  recoveredSkillId: string;
  unlockedModules: string[];
  newReadinessScore: number;
  mutatedRoadmap: LearningRoadmap;
}

export interface PivotCareerResponse {
  success: boolean;
  oldCareerId: string;
  newCareerId: string;
  pivotResult: {
    targetCareerId: string;
    overallReadinessScore: number;
    transferredSkills: {
      skillId: string;
      skillName: string;
      validatedLevel: string;
      matchStatus: string;
    }[];
    newSkillsToLearn: {
      skillId: string;
      requiredLevel: string;
      weight: number;
    }[];
    unassessedNewSkills: string[];
  };
  updatedRoadmap: LearningRoadmap;
  updatedGapMatrix: CareerGapMatrix;
  skillCapitalLedger: {
    hoursSaved: number;
    retainedValidatedSkills: string[];
    contextualBridgeCount: number;
    unassessedSkillCount: number;
    projectedReadinessJump: number;
  };
  agentTrace: AgentTraceEntry[];
}

export interface TestPipelineStageResult {
  stage: string;
  description: string;
  passed: boolean;
  details?: unknown;
}

export interface TestPipelineResponse {
  success: boolean;
  executedAt: string;
  durationMs: number;
  stages: TestPipelineStageResult[];
  summary: {
    totalStages: number;
    passedStages: number;
    failedStages: number;
    allAssertionsPassed: boolean;
  };
}

export function adaptStagedCandidates(
  candidates: StagedCandidateSkill[]
): StagedCandidateSkill[] {
  return candidates.map((c) => ({
    ...c,
    userConfirmed: c.userConfirmed ?? false,
    requiresUserConfirmation: c.requiresUserConfirmation ?? true,
  }));
}

export function adaptValidationRecords(
  records: SkillValidationRecord[]
): SkillValidationRecord[] {
  return records.map((r) => ({
    ...r,
    verifiedTopics: r.verifiedTopics || [],
    weakTopics: r.weakTopics || [],
    platformEvidence: r.platformEvidence || [],
    rapidGuessDetected: r.rapidGuessDetected ?? false,
    calibrationDelta: r.calibrationDelta ?? 0,
  }));
}

