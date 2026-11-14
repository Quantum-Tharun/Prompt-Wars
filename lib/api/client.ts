import { ApiError } from "./errors";
import {
  type LearnerBackground,
  type SelfReportedSkillClaim,
  type PlatformConsentEnvelope,
  type PlatformFootprintResult,
  type SkillValidationRecord,
  type CareerId,
  type LearningRoadmap,
} from "@/lib/schemas/domain.schema";
import {
  type OrchestrationResponse,
  type AdaptCheckpointResponse,
  type VerifyRecoveryResponse,
  type PivotCareerResponse,
  type TestPipelineResponse,
} from "./adapters";

async function postJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: json.error || `HTTP_${res.status}`,
      message: json.message || json.error || `Request failed with status ${res.status}`,
      details: json.details,
    });
  }

  return json as T;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: json.error || `HTTP_${res.status}`,
      message: json.message || json.error || `Request failed with status ${res.status}`,
      details: json.details,
    });
  }

  return json as T;
}

export const apiClient = {
  // Stage 1: Discovery Init
  async initProfile(
    background: LearnerBackground,
    claims: SelfReportedSkillClaim[]
  ): Promise<{
    success: boolean;
    learnerId: string;
    targetCareerId: CareerId;
    claimsRegistered: number;
    unverifiedSkills: SkillValidationRecord[];
  }> {
    return postJson("/api/discovery/init", { background, claims });
  },

  // Stage 2: Platform Connect (explicit consent gate)
  async connectPlatforms(
    learnerId: string,
    envelopes: PlatformConsentEnvelope[]
  ): Promise<{
    success: boolean;
    footprint: PlatformFootprintResult;
  }> {
    return postJson("/api/platforms/connect", { learnerId, envelopes });
  },

  // Stage 3: Adaptive Questions
  async getAssessmentQuestions(
    claims: SelfReportedSkillClaim[],
    targetCareerId: CareerId
  ): Promise<{
    success: boolean;
    targetCareerId: CareerId;
    totalQuestions: number;
    questionsBySkill: Record<
      string,
      {
        id: string;
        skillId: string;
        topicTag: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        cognitiveTier: "syntax_recall" | "code_tracing" | "scenario_debugging";
        prompt: string;
        codeSnippet?: string;
        options: [string, string, string, string];
      }[]
    >;
    allQuestions: {
      id: string;
      skillId: string;
      topicTag: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      cognitiveTier: "syntax_recall" | "code_tracing" | "scenario_debugging";
      prompt: string;
      codeSnippet?: string;
      options: [string, string, string, string];
    }[];
  }> {
    return postJson("/api/assessment/questions", { claims, targetCareerId });
  },

  // Stage 4: Validate Assessment Only (Agent 1)
  async validateAssessment(
    background: LearnerBackground,
    claims: SelfReportedSkillClaim[],
    answers: { questionId: string; selectedIndex: number }[]
  ): Promise<{
    success: boolean;
    learnerId: string;
    validatedSkills: SkillValidationRecord[];
    skillAnalysis?: unknown;
    agentTrace: unknown[];
  }> {
    return postJson("/api/assessment/validate", { background, claims, answers });
  },

  // Unified Orchestration: Validate + Gap Matrix + Agents 1-3 + 5-Phase Roadmap
  async orchestratePipeline(
    background: LearnerBackground,
    claims: SelfReportedSkillClaim[],
    answers: { questionId: string; selectedIndex: number; timeSpentMs?: number }[],
    platformSignals?: Record<
      string,
      { repoCount?: number; certCount?: number; evidenceSource?: string }
    >
  ): Promise<OrchestrationResponse> {
    return postJson("/api/orchestrate", {
      background,
      claims,
      answers,
      platformSignals,
    });
  },

  // Stage 6: Mentor Adapt (35% JS failure -> Surgical Splice)
  async adaptCheckpointFailure(
    roadmap: LearningRoadmap,
    skillId: string,
    answers: { questionId: string; selectedIndex: number }[]
  ): Promise<AdaptCheckpointResponse> {
    return postJson("/api/mentor/adapt", { roadmap, skillId, answers });
  },

  // Stage 6b: Mentor Verify (100% recovery quiz -> Gate Unlock)
  async verifyRecoveryQuiz(
    roadmap: LearningRoadmap,
    skillId: string,
    remediationModuleId: string,
    validatedSkills: SkillValidationRecord[],
    answers: { questionId: string; selectedIndex: number }[]
  ): Promise<VerifyRecoveryResponse> {
    return postJson("/api/mentor/verify", {
      roadmap,
      skillId,
      remediationModuleId,
      validatedSkills,
      answers,
    });
  },

  // Stage 7: Career Switch
  async pivotCareer(
    background: LearnerBackground,
    validatedSkills: SkillValidationRecord[],
    oldCareerId: CareerId,
    newCareerId: CareerId
  ): Promise<PivotCareerResponse> {
    return postJson("/api/career/pivot", {
      background,
      validatedSkills,
      oldCareerId,
      newCareerId,
    });
  },

  // Self-Test Pipeline
  async runSelfTest(): Promise<TestPipelineResponse> {
    return getJson("/api/test-pipeline");
  },
};

