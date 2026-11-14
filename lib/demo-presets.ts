import {
  type LearnerBackground,
  type SelfReportedSkillClaim,
  type SkillValidationRecord,
  type CareerGapMatrix,
  type LearningRoadmap,
  type PlatformConsentEnvelope,
} from "./schemas/domain.schema";

export interface DemoPresetState {
  background: LearnerBackground;
  consentEnvelopes: PlatformConsentEnvelope[];
  claims: SelfReportedSkillClaim[];
  validatedSkills: SkillValidationRecord[];
  gapMatrix?: CareerGapMatrix;
  roadmap?: LearningRoadmap;
  activeStage: number; // 1 to 5
}

export const PRESET_1_ONBOARDING: DemoPresetState = {
  activeStage: 1,
  background: {
    learnerId: "alex_chen_demo",
    name: "Alex Chen",
    educationLevel: "B.Tech in Computer Science",
    fieldOfStudy: "Information Technology",
    hasPriorProjects: true,
    priorCertifications: ["CS50x Harvard"],
    targetCareerId: "fullstack_dev",
    weeklyLearningHours: 8,
  },
  consentEnvelopes: [
    {
      platform: "github",
      consentGranted: true,
      consentedAt: "2026-11-14T08:00:00Z",
      authorizedScopes: ["read:user", "read:public_repo"],
      accountIdentifier: "alex-fullstack-demo",
    },
    {
      platform: "linkedin",
      consentGranted: true,
      consentedAt: "2026-11-14T08:00:00Z",
      authorizedScopes: ["r_basicprofile", "r_skill_certs"],
      accountIdentifier: "alex-chen-in",
    },
    {
      platform: "leetcode",
      consentGranted: true,
      consentedAt: "2026-11-14T08:00:00Z",
      authorizedScopes: ["read:public_profile"],
      accountIdentifier: "alex-coder-lc",
    },
  ],
  claims: [
    { skillId: "python", claimedLevel: "intermediate", userConfirmed: true },
    { skillId: "sql", claimedLevel: "intermediate", userConfirmed: true },
    { skillId: "html", claimedLevel: "beginner", userConfirmed: true },
    { skillId: "javascript", claimedLevel: "none", userConfirmed: true },
  ],
  validatedSkills: [],
};

export const PRESET_2_CALIBRATED: DemoPresetState = {
  ...PRESET_1_ONBOARDING,
  activeStage: 3,
  validatedSkills: [
    {
      skillId: "python",
      skillName: "Python",
      selfReportedLevel: "intermediate",
      validatedLevel: "intermediate",
      assessmentScore: 86,
      calibrationState: "calibrated",
      calibrationDelta: 0,
      confidence: "high",
      triangulatedArchetype: "verified_practitioner",
      questionsAttempted: 3,
      verifiedTopics: ["py_control_flow", "py_functions"],
      weakTopics: [],
      evidenceSummary: "Consistently scored 86% across lexical scope and loops. GitHub repos (4 active) and LeetCode confirm practitioner mastery.",
      platformEvidence: ["GitHub API: 4 public repos in Python", "LeetCode: 28 solved problems"],
      rapidGuessDetected: false,
      averageTimeSpentMs: 14200,
    },
    {
      skillId: "sql",
      skillName: "SQL & Relational Databases",
      selfReportedLevel: "intermediate",
      validatedLevel: "beginner",
      assessmentScore: 50,
      calibrationState: "overconfident",
      calibrationDelta: -1,
      confidence: "medium",
      triangulatedArchetype: "certificate_collector",
      questionsAttempted: 3,
      verifiedTopics: ["sql_select_filter"],
      weakTopics: [
        { topicTag: "sql_aggregation", failedCognitiveTier: "code_tracing", questionId: "sql_q2" },
        { topicTag: "sql_joins", failedCognitiveTier: "syntax_recall", questionId: "sql_q3" },
      ],
      evidenceSummary: "Illusion of Competence: Claimed intermediate due to 2 LinkedIn certs, but failed relational JOIN predicates and GROUP BY aggregations (50% score).",
      platformEvidence: ["LinkedIn: 2 Course Certificates in SQL"],
      rapidGuessDetected: false,
      averageTimeSpentMs: 11800,
    },
    {
      skillId: "html",
      skillName: "HTML5",
      selfReportedLevel: "beginner",
      validatedLevel: "beginner",
      assessmentScore: 86,
      calibrationState: "calibrated",
      calibrationDelta: 0,
      confidence: "high",
      triangulatedArchetype: "calibrated_learner",
      questionsAttempted: 3,
      verifiedTopics: ["html_semantics", "html_forms"],
      weakTopics: [],
      evidenceSummary: "Accurately calibrated at beginner level (86% score) across semantic landmarks and forms.",
      platformEvidence: ["GitHub: 2 responsive landing pages"],
      rapidGuessDetected: false,
      averageTimeSpentMs: 9500,
    },
    {
      skillId: "javascript",
      skillName: "JavaScript",
      selfReportedLevel: "none",
      validatedLevel: "none",
      assessmentScore: 0,
      calibrationState: "unverified",
      calibrationDelta: 0,
      confidence: "low",
      triangulatedArchetype: "unverified_claim",
      questionsAttempted: 0,
      verifiedTopics: [],
      weakTopics: [],
      evidenceSummary: "Self-reported 'none'. Flagged as top critical path gap for Full Stack Developer.",
      platformEvidence: ["GitHub: 1 tutorial clone (weather app)"],
      rapidGuessDetected: false,
    },
  ],
};

export const PRESET_3_FAILED_REMEDIATION: DemoPresetState = {
  ...PRESET_2_CALIBRATED,
  activeStage: 4,
};

export const PRESET_4_PIVOT_DATA_ANALYST: DemoPresetState = {
  ...PRESET_2_CALIBRATED,
  activeStage: 5,
  background: {
    ...PRESET_2_CALIBRATED.background,
    targetCareerId: "data_analyst",
  },
};

