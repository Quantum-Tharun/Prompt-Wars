import { z } from "zod";

export const ProficiencyLevelSchema = z.enum(["none", "beginner", "intermediate", "advanced"]);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const PROFICIENCY_RANK: Record<ProficiencyLevel, number> = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export const CognitiveTierSchema = z.enum(["syntax_recall", "code_tracing", "scenario_debugging"]);
export type CognitiveTier = z.infer<typeof CognitiveTierSchema>;

export const COGNITIVE_WEIGHT: Record<CognitiveTier, number> = {
  syntax_recall: 1,
  code_tracing: 2,
  scenario_debugging: 3,
};

export const CalibrationStateSchema = z.enum([
  "overconfident",   // Claimed > Validated ("Illusion of Competence")
  "calibrated",      // Claimed === Validated
  "underconfident",  // Validated > Claimed ("Hidden Strength")
  "unverified",      // Not yet assessed
]);
export type CalibrationState = z.infer<typeof CalibrationStateSchema>;

export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const TriangulatedArchetypeSchema = z.enum([
  "verified_practitioner",       // Repos >= 2 AND Quiz >= 75%
  "tutorial_cloner",             // Repos >= 2 AND Quiz < 60%
  "certificate_collector",       // Certs >= 1 AND Quiz < 60%
  "portfolio_starved_theorist",   // Repos === 0 AND Quiz >= 75%
  "hidden_practitioner",         // Validated > Claimed AND Quiz >= 75%
  "overconfident_novice",        // Claimed > Validated AND Quiz < 60%
  "calibrated_learner",          // Default calibrated
  "unverified_claim",            // Pre-assessment
]);
export type TriangulatedArchetype = z.infer<typeof TriangulatedArchetypeSchema>;

// --- PLATFORM CONSENT & FOOTPRINT SCHEMAS ---
export const PlatformConsentEnvelopeSchema = z.object({
  platform: z.enum(["github", "linkedin", "leetcode", "kaggle"]),
  consentGranted: z.boolean(),
  consentedAt: z.string(),
  authorizedScopes: z.array(z.string()).min(1),
  accountIdentifier: z.string().min(1),
});
export type PlatformConsentEnvelope = z.infer<typeof PlatformConsentEnvelopeSchema>;

export const StagedCandidateSkillSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  platformOrigin: z.enum(["github", "linkedin", "leetcode", "kaggle", "self_reported"]),
  impliedLevel: ProficiencyLevelSchema,
  confidence: ConfidenceLevelSchema,
  evidenceSource: z.string(),
  metricSummary: z.string(),
  requiresUserConfirmation: z.boolean().default(true),
  userConfirmed: z.boolean().default(false),
});
export type StagedCandidateSkill = z.infer<typeof StagedCandidateSkillSchema>;

export const PlatformFootprintResultSchema = z.object({
  learnerId: z.string(),
  consentedPlatforms: z.array(z.string()),
  stagedCandidates: z.array(StagedCandidateSkillSchema),
  rawMetrics: z.record(z.string(), z.string()).default({}),
});
export type PlatformFootprintResult = z.infer<typeof PlatformFootprintResultSchema>;

// --- STATIC CATALOGUE SCHEMAS ---
export const SkillCatalogueItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["programming_languages", "web_development", "databases", "ai_data_science"]),
  description: z.string(),
  microTopics: z.array(
    z.object({
      tag: z.string(),
      label: z.string(),
      foundational: z.boolean(),
    })
  ),
});
export type SkillCatalogueItem = z.infer<typeof SkillCatalogueItemSchema>;

export const QuestionItemSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  topicTag: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  cognitiveTier: CognitiveTierSchema,
  prompt: z.string(),
  codeSnippet: z.string().optional(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});
export type QuestionItem = z.infer<typeof QuestionItemSchema>;

export const CareerRequirementSchema = z.object({
  skillId: z.string(),
  requiredLevel: z.enum(["beginner", "intermediate", "advanced"]),
  weight: z.number().int().min(1).max(5),
  criticalTopicTags: z.array(z.string()),
});
export type CareerRequirement = z.infer<typeof CareerRequirementSchema>;

export const CareerCatalogueItemSchema = z.object({
  id: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
  title: z.string(),
  description: z.string(),
  requirements: z.array(CareerRequirementSchema),
});
export type CareerCatalogueItem = z.infer<typeof CareerCatalogueItemSchema>;
export type CareerId = CareerCatalogueItem["id"];

export const ResourceItemSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  topicTags: z.array(z.string()),
  title: z.string(),
  provider: z.string(),
  type: z.enum(["documentation", "interactive_tutorial", "video_course", "practice_lab"]),
  url: z.string().url(),
  targetLevel: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedHours: z.number().positive(),
});
export type ResourceItem = z.infer<typeof ResourceItemSchema>;

// --- LEARNER & VALIDATION SCHEMAS ---
export const LearnerProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
});
export type LearnerProject = z.infer<typeof LearnerProjectSchema>;

export const LearnerBackgroundSchema = z.object({
  learnerId: z.string(),
  name: z.string().min(1),
  educationLevel: z.string(),
  fieldOfStudy: z.string(),
  hasPriorProjects: z.boolean(),
  priorCertifications: z.array(z.string()).default([]),
  projects: z.array(LearnerProjectSchema).optional(),
  interests: z.array(z.string()).optional(),
  targetCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
  weeklyLearningHours: z.number().min(1).max(60),
});
export type LearnerBackground = z.infer<typeof LearnerBackgroundSchema>;

export const SelfReportedSkillClaimSchema = z.object({
  skillId: z.string(),
  claimedLevel: ProficiencyLevelSchema,
  userConfirmed: z.boolean().default(true),
});
export type SelfReportedSkillClaim = z.infer<typeof SelfReportedSkillClaimSchema>;

export const WeakTopicRecordSchema = z.object({
  topicTag: z.string(),
  failedCognitiveTier: CognitiveTierSchema,
  questionId: z.string(),
});
export type WeakTopicRecord = z.infer<typeof WeakTopicRecordSchema>;

export const SkillValidationRecordSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  selfReportedLevel: ProficiencyLevelSchema,
  validatedLevel: ProficiencyLevelSchema,
  assessmentScore: z.number().min(0).max(100),
  calibrationState: CalibrationStateSchema,
  calibrationDelta: z.number().int().min(-3).max(3),
  confidence: ConfidenceLevelSchema,
  triangulatedArchetype: TriangulatedArchetypeSchema.default("unverified_claim"),
  questionsAttempted: z.number().int().min(0),
  verifiedTopics: z.array(z.string()),
  weakTopics: z.array(WeakTopicRecordSchema),
  evidenceSummary: z.string(),
  platformEvidence: z.array(z.string()).default([]),
  rapidGuessDetected: z.boolean().default(false),
  averageTimeSpentMs: z.number().optional(),
});
export type SkillValidationRecord = z.infer<typeof SkillValidationRecordSchema>;

// --- CAREER GAP & TRANSFER SCHEMAS ---
export const SkillGapItemSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  currentValidatedLevel: ProficiencyLevelSchema,
  requiredLevel: z.enum(["beginner", "intermediate", "advanced"]),
  weight: z.number(),
  gapClassification: z.enum(["existing_capability", "improvement_needed", "new_learning_needed"]),
  levelDeficit: z.number().int().min(0).max(3),
  missingCriticalTopics: z.array(z.string()),
  priorityScore: z.number(),
  estimatedHours: z.number().default(0),
  readinessGain: z.number().default(0),
});
export type SkillGapItem = z.infer<typeof SkillGapItemSchema>;

export const CareerGapMatrixSchema = z.object({
  targetCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
  targetCareerTitle: z.string(),
  overallReadinessScore: z.number().min(0).max(100),
  existingCapabilities: z.array(SkillGapItemSchema),
  improvementsNeeded: z.array(SkillGapItemSchema),
  newLearningNeeded: z.array(SkillGapItemSchema),
  estimatedTotalHoursToReady: z.number(),
  estimatedWeeksToReady: z.number(),
});
export type CareerGapMatrix = z.infer<typeof CareerGapMatrixSchema>;

// --- ROADMAP & DAG MODULE SCHEMAS ---
export const RoadmapProvenanceSchema = z.object({
  triggerType: z.enum([
    "calibration_gap",
    "missing_career_requirement",
    "surgical_remediation",
    "archetype_prescription",
  ]),
  sourceQuestionIds: z.array(z.string()).default([]),
  failedTopicTags: z.array(z.string()).default([]),
  calibrationDelta: z.number().default(0),
  triangulatedArchetype: z.string().default("calibrated_learner"),
  careerWeight: z.number().default(3),
  auditTrailText: z.string(),
});
export type RoadmapProvenance = z.infer<typeof RoadmapProvenanceSchema>;

export const RoadmapModuleSchema = z.object({
  moduleId: z.string(),
  phaseNumber: z.number().int().min(1).max(5),
  phaseTitle: z.string(),
  title: z.string(),
  skillId: z.string(),
  targetTopics: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  priority: z.enum(["critical_remediation", "high_priority_gap", "core_curriculum", "capstone"]),
  status: z.enum(["unlocked", "locked", "in_progress", "completed"]),
  prerequisiteModuleIds: z.array(z.string()),
  curatedResourceIds: z.array(z.string()),
  practicalExercisePrompt: z.string(),
  estimatedHours: z.number().positive(),
  readinessImpactPercent: z.number().default(5),
  roiPerHour: z.number().default(0.5),
  isAdaptiveInsertion: z.boolean().default(false),
  insertionReason: z.string().optional(),
  provenance: RoadmapProvenanceSchema.optional(),
});
export type RoadmapModule = z.infer<typeof RoadmapModuleSchema>;

export const AgentTraceEntrySchema = z.object({
  agentName: z.enum(["SkillAnalyzer", "CareerGapAnalyst", "LearningPlanner", "AdaptiveMentor"]),
  executedAt: z.string(),
  durationMs: z.number(),
  usedFallback: z.boolean(),
  inputSummary: z.string(),
  keyFindings: z.array(z.string()),
});
export type AgentTraceEntry = z.infer<typeof AgentTraceEntrySchema>;

export const LearningRoadmapSchema = z.object({
  roadmapId: z.string(),
  learnerId: z.string(),
  targetCareerId: z.enum(["fullstack_dev", "data_analyst", "aiml_engineer"]),
  generatedAt: z.string(),
  revisionNumber: z.number().int().min(1),
  totalEstimatedHours: z.number(),
  projectedCompletionWeeks: z.number(),
  modules: z.array(RoadmapModuleSchema),
  revisionHistory: z.array(
    z.object({
      revisionNumber: z.number(),
      timestamp: z.string(),
      trigger: z.enum(["initial_generation", "checkpoint_failure_remediation", "remediation_recovery", "career_pivot"]),
      summary: z.string(),
    })
  ),
});
export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>;
