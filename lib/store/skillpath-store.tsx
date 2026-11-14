"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import {
  type LearnerBackground,
  type SelfReportedSkillClaim,
  type PlatformConsentEnvelope,
  type StagedCandidateSkill,
  type PlatformFootprintResult,
  type SkillValidationRecord,
  type CareerGapMatrix,
  type LearningRoadmap,
  type RoadmapModule,
  type WeakTopicRecord,
  type AgentTraceEntry,
  type CareerId,
  type CognitiveTier,
  type ProficiencyLevel,
} from "@/lib/schemas/domain.schema";
import {
  type OrchestrationResponse,
  type AdaptCheckpointResponse,
  type VerifyRecoveryResponse,
  type PivotCareerResponse,
} from "@/lib/api/adapters";
import { PRESET_1_ONBOARDING, PRESET_2_CALIBRATED } from "@/lib/demo-presets";

export interface QuestionClientItem {
  id: string;
  skillId: string;
  topicTag: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  cognitiveTier: "syntax_recall" | "code_tracing" | "scenario_debugging";
  prompt: string;
  codeSnippet?: string;
  options: [string, string, string, string];
}

export interface SkillPathState {
  activeStage: number; // 1 to 7
  presenterStripOpen: boolean;
  evidencePanelOpen: boolean; // mobile drawer toggle

  // Form inputs
  background: LearnerBackground;
  claims: SelfReportedSkillClaim[];
  consentEnvelopes: PlatformConsentEnvelope[];
  stagedCandidates: StagedCandidateSkill[];
  platformFootprint: PlatformFootprintResult | null;

  // Assessment
  assessmentQuestionsBySkill: Record<string, QuestionClientItem[]>;
  allAssessmentQuestions: QuestionClientItem[];
  currentSkillIndex: number;
  currentQuestionIndex: number;
  userAnswers: { questionId: string; selectedIndex: number; timeSpentMs: number }[];

  // Validated Results & Roadmap
  validatedSkills: SkillValidationRecord[];
  gapMatrix: CareerGapMatrix | null;
  roadmap: LearningRoadmap | null;
  completedModuleIds: string[]; // Interactive progress module completions
  agentTraces: AgentTraceEntry[];

  // Mentor Checkpoint & Remediation
  checkpointScore: number | null;
  failedWeakTopics: WeakTopicRecord[];
  insertedRemediationModule: RoadmapModule | null;
  mentorCoaching: {
    diagnosisHeadline: string;
    conceptBreakdowns: {
      topicTag: string;
      whyItMatters: string;
      mentalModelTip: string;
    }[];
    roadmapMutationExplanation: string;
    nextImmediateStep: string;
  } | null;
  recoveryPassed: boolean;
  preRecoveryReadiness: number | null;
  postRecoveryReadiness: number | null;

  // Career Switch
  careerPivotResult: PivotCareerResponse | null;

  // Inspection Focus
  selectedModuleId: string | null;
  selectedTopicTag: string | null;

  // Async UI State
  isLoading: boolean;
  loadingMessage: string;
  requestStartTime: number | null;
}

const DEFAULT_BACKGROUND: LearnerBackground = {
  learnerId: "alex_chen_demo",
  name: "Alex Chen",
  educationLevel: "B.Tech in Computer Science",
  fieldOfStudy: "Information Technology",
  hasPriorProjects: true,
  priorCertifications: ["CS50x Harvard", "Meta Front-End Spec (In Progress)"],
  projects: [
    {
      name: "Personal Portfolio & Technical Blog",
      description: "Responsive personal blog built with semantic HTML, CSS Grid, and vanilla JS DOM manipulation.",
      techStack: ["html", "css", "javascript"],
    },
    {
      name: "CLI Transaction Parser",
      description: "Automated Python utility to parse bank CSV statements and load structured summaries into SQLite.",
      techStack: ["python", "sql"],
    },
  ],
  interests: ["Distributed backend systems", "Relational database performance", "Data analysis pipelines"],
  targetCareerId: "fullstack_dev",
  weeklyLearningHours: 8,
};

const DEFAULT_CLAIMS: SelfReportedSkillClaim[] = [
  { skillId: "python", claimedLevel: "intermediate", userConfirmed: true },
  { skillId: "sql", claimedLevel: "intermediate", userConfirmed: true },
  { skillId: "html", claimedLevel: "beginner", userConfirmed: true },
  { skillId: "javascript", claimedLevel: "none", userConfirmed: true },
];

const DEFAULT_ENVELOPES: PlatformConsentEnvelope[] = [
  {
    platform: "github",
    consentGranted: true,
    consentedAt: "2026-11-14T08:00:00Z",
    authorizedScopes: ["read:public_repo"],
    accountIdentifier: "alex-fullstack-demo",
  },
  {
    platform: "linkedin",
    consentGranted: true,
    consentedAt: "2026-11-14T08:00:00Z",
    authorizedScopes: ["r_skill_certs"],
    accountIdentifier: "alex-chen-in",
  },
  {
    platform: "leetcode",
    consentGranted: true,
    consentedAt: "2026-11-14T08:00:00Z",
    authorizedScopes: ["read:public_profile"],
    accountIdentifier: "alex-coder-lc",
  },
  {
    platform: "kaggle",
    consentGranted: false,
    consentedAt: "2026-11-14T08:00:00Z",
    authorizedScopes: ["read:competitions"],
    accountIdentifier: "alexchen-kaggle",
  },
];

const INITIAL_STATE: SkillPathState = {
  activeStage: 0,
  presenterStripOpen: true,
  evidencePanelOpen: false,

  background: DEFAULT_BACKGROUND,
  claims: DEFAULT_CLAIMS,
  consentEnvelopes: DEFAULT_ENVELOPES,
  stagedCandidates: [],
  platformFootprint: null,

  assessmentQuestionsBySkill: {},
  allAssessmentQuestions: [],
  currentSkillIndex: 0,
  currentQuestionIndex: 0,
  userAnswers: [],

  validatedSkills: [],
  gapMatrix: null,
  roadmap: null,
  completedModuleIds: [],
  agentTraces: [],

  checkpointScore: null,
  failedWeakTopics: [],
  insertedRemediationModule: null,
  mentorCoaching: null,
  recoveryPassed: false,
  preRecoveryReadiness: null,
  postRecoveryReadiness: null,

  careerPivotResult: null,

  selectedModuleId: null,
  selectedTopicTag: null,

  isLoading: false,
  loadingMessage: "",
  requestStartTime: null,
};

export type SkillPathAction =
  | { type: "SET_ACTIVE_STAGE"; stage: number }
  | { type: "TOGGLE_PRESENTER_STRIP" }
  | { type: "SET_PRESENTER_STRIP"; open: boolean }
  | { type: "TOGGLE_EVIDENCE_PANEL" }
  | { type: "SET_EVIDENCE_PANEL"; open: boolean }
  | { type: "UPDATE_BACKGROUND"; patch: Partial<LearnerBackground> }
  | { type: "SET_CLAIMS"; claims: SelfReportedSkillClaim[] }
  | { type: "SET_CONSENT_ENVELOPES"; envelopes: PlatformConsentEnvelope[] }
  | { type: "UPDATE_SINGLE_CONSENT"; platform: "github" | "linkedin" | "leetcode" | "kaggle"; consentGranted: boolean; accountIdentifier?: string }
  | { type: "SET_STAGED_CANDIDATES"; candidates: StagedCandidateSkill[] }
  | { type: "TOGGLE_CANDIDATE_CONFIRMATION"; skillId: string }
  | { type: "UPDATE_CANDIDATE_LEVEL"; skillId: string; level: "none" | "beginner" | "intermediate" | "advanced" }
  | { type: "SET_PLATFORM_FOOTPRINT"; footprint: PlatformFootprintResult | null }
  | {
      type: "SET_ASSESSMENT_QUESTIONS";
      questionsBySkill: Record<string, QuestionClientItem[]>;
      allQuestions: QuestionClientItem[];
    }
  | { type: "SET_CURRENT_QUESTION"; skillIndex: number; questionIndex: number }
  | { type: "RECORD_ANSWER"; questionId: string; selectedIndex: number; timeSpentMs: number }
  | { type: "SET_ORCHESTRATION_DATA"; payload: OrchestrationResponse }
  | { type: "SET_MENTOR_ADAPT_DATA"; payload: AdaptCheckpointResponse }
  | { type: "SET_MENTOR_VERIFY_DATA"; payload: VerifyRecoveryResponse }
  | { type: "SET_CAREER_PIVOT_DATA"; payload: PivotCareerResponse }
  | { type: "SET_SELECTED_MODULE"; moduleId: string | null }
  | { type: "SET_SELECTED_TOPIC"; topicTag: string | null }
  | { type: "TOGGLE_MODULE_COMPLETION"; moduleId: string }
  | { type: "START_LOADING"; message: string }
  | { type: "STOP_LOADING" }
  | { type: "LOAD_PRESET"; presetNumber: 1 | 2 | 3 | 4 }
  | { type: "RESET_ALL" };

function skillPathReducer(state: SkillPathState, action: SkillPathAction): SkillPathState {
  switch (action.type) {
    case "SET_ACTIVE_STAGE":
      return { ...state, activeStage: action.stage };

    case "TOGGLE_PRESENTER_STRIP":
      return { ...state, presenterStripOpen: !state.presenterStripOpen };

    case "SET_PRESENTER_STRIP":
      return { ...state, presenterStripOpen: action.open };

    case "TOGGLE_EVIDENCE_PANEL":
      return { ...state, evidencePanelOpen: !state.evidencePanelOpen };

    case "SET_EVIDENCE_PANEL":
      return { ...state, evidencePanelOpen: action.open };

    case "UPDATE_BACKGROUND":
      return {
        ...state,
        background: { ...state.background, ...action.patch },
      };

    case "SET_CLAIMS":
      return { ...state, claims: action.claims };

    case "SET_CONSENT_ENVELOPES":
      return { ...state, consentEnvelopes: action.envelopes };

    case "UPDATE_SINGLE_CONSENT":
      return {
        ...state,
        consentEnvelopes: state.consentEnvelopes.map((env) =>
          env.platform === action.platform
            ? {
                ...env,
                consentGranted: action.consentGranted,
                accountIdentifier: action.accountIdentifier ?? env.accountIdentifier,
                consentedAt: new Date().toISOString(),
              }
            : env
        ),
      };

    case "SET_STAGED_CANDIDATES":
      return { ...state, stagedCandidates: action.candidates };

    case "TOGGLE_CANDIDATE_CONFIRMATION":
      return {
        ...state,
        stagedCandidates: state.stagedCandidates.map((c) =>
          c.skillId === action.skillId
            ? { ...c, userConfirmed: !c.userConfirmed }
            : c
        ),
      };

    case "UPDATE_CANDIDATE_LEVEL":
      return {
        ...state,
        stagedCandidates: state.stagedCandidates.map((c) =>
          c.skillId === action.skillId
            ? { ...c, impliedLevel: action.level }
            : c
        ),
      };

    case "SET_PLATFORM_FOOTPRINT":
      return { ...state, platformFootprint: action.footprint };

    case "SET_ASSESSMENT_QUESTIONS":
      return {
        ...state,
        assessmentQuestionsBySkill: action.questionsBySkill,
        allAssessmentQuestions: action.allQuestions,
        currentSkillIndex: 0,
        currentQuestionIndex: 0,
      };

    case "SET_CURRENT_QUESTION":
      return {
        ...state,
        currentSkillIndex: action.skillIndex,
        currentQuestionIndex: action.questionIndex,
      };

    case "RECORD_ANSWER": {
      const existing = state.userAnswers.filter((a) => a.questionId !== action.questionId);
      return {
        ...state,
        userAnswers: [
          ...existing,
          {
            questionId: action.questionId,
            selectedIndex: action.selectedIndex,
            timeSpentMs: action.timeSpentMs,
          },
        ],
      };
    }

    case "SET_ORCHESTRATION_DATA":
      return {
        ...state,
        validatedSkills: action.payload.validatedSkills,
        gapMatrix: action.payload.gapMatrix,
        roadmap: action.payload.roadmap,
        agentTraces: action.payload.agentTrace,
        selectedModuleId: action.payload.roadmap.modules[0]?.moduleId || null,
      };

    case "SET_MENTOR_ADAPT_DATA":
      return {
        ...state,
        checkpointScore: action.payload.quizScore,
        failedWeakTopics: action.payload.failedWeakTopics.map((w) => ({
          ...w,
          failedCognitiveTier: w.failedCognitiveTier as CognitiveTier,
        })),
        roadmap: action.payload.mutatedRoadmap,
        insertedRemediationModule: action.payload.insertedModule,
        mentorCoaching: action.payload.mentorCoaching,
        selectedModuleId: action.payload.insertedModule?.moduleId || state.selectedModuleId,
      };

    case "SET_MENTOR_VERIFY_DATA":
      return {
        ...state,
        recoveryPassed: true,
        roadmap: action.payload.mutatedRoadmap,
        preRecoveryReadiness: state.gapMatrix?.overallReadinessScore ?? 42,
        postRecoveryReadiness: action.payload.newReadinessScore,
        selectedModuleId:
          action.payload.mutatedRoadmap.modules.find((m) => m.skillId === "react")?.moduleId ||
          state.selectedModuleId,
      };

    case "SET_CAREER_PIVOT_DATA":
      return {
        ...state,
        careerPivotResult: action.payload,
        roadmap: action.payload.updatedRoadmap,
        gapMatrix: action.payload.updatedGapMatrix,
        background: {
          ...state.background,
          targetCareerId: action.payload.newCareerId as CareerId,
        },
        selectedModuleId: action.payload.updatedRoadmap.modules[0]?.moduleId || null,
      };

    case "SET_SELECTED_MODULE":
      return { ...state, selectedModuleId: action.moduleId };

    case "SET_SELECTED_TOPIC":
      return { ...state, selectedTopicTag: action.topicTag };

    case "TOGGLE_MODULE_COMPLETION": {
      const isCompleted = state.completedModuleIds.includes(action.moduleId);
      const updatedCompleted = isCompleted
        ? state.completedModuleIds.filter((id) => id !== action.moduleId)
        : [...state.completedModuleIds, action.moduleId];

      // Mutate module status in roadmap if roadmap exists
      const updatedRoadmap = state.roadmap
        ? {
            ...state.roadmap,
            modules: state.roadmap.modules.map((m) =>
              m.moduleId === action.moduleId
                ? {
                    ...m,
                    status: (isCompleted ? "unlocked" : "completed") as "unlocked" | "completed",
                  }
                : m
            ),
          }
        : null;

      return {
        ...state,
        completedModuleIds: updatedCompleted,
        roadmap: updatedRoadmap,
      };
    }

    case "START_LOADING":
      return {
        ...state,
        isLoading: true,
        loadingMessage: action.message,
        requestStartTime: Date.now(),
      };

    case "STOP_LOADING":
      return {
        ...state,
        isLoading: false,
        loadingMessage: "",
        requestStartTime: null,
      };

    case "LOAD_PRESET": {
      if (action.presetNumber === 1) {
        return {
          ...INITIAL_STATE,
          activeStage: 2,
          background: PRESET_1_ONBOARDING.background,
          consentEnvelopes: PRESET_1_ONBOARDING.consentEnvelopes,
          claims: PRESET_1_ONBOARDING.claims,
        };
      }
      if (action.presetNumber === 2) {
        return {
          ...state,
          activeStage: 4,
          background: PRESET_2_CALIBRATED.background,
          consentEnvelopes: PRESET_2_CALIBRATED.consentEnvelopes,
          claims: PRESET_2_CALIBRATED.claims,
          validatedSkills: PRESET_2_CALIBRATED.validatedSkills,
        };
      }
      if (action.presetNumber === 3) {
        return {
          ...state,
          activeStage: 6,
          background: PRESET_2_CALIBRATED.background,
          claims: PRESET_2_CALIBRATED.claims,
          validatedSkills: PRESET_2_CALIBRATED.validatedSkills,
        };
      }
      if (action.presetNumber === 4) {
        return {
          ...state,
          activeStage: 8,
          background: {
            ...PRESET_2_CALIBRATED.background,
            targetCareerId: "data_analyst",
          },
          claims: PRESET_2_CALIBRATED.claims,
          validatedSkills: PRESET_2_CALIBRATED.validatedSkills,
        };
      }
      return state;
    }

    case "RESET_ALL":
      return INITIAL_STATE;

    default:
      return state;
  }
}

interface SkillPathContextType {
  state: SkillPathState;
  dispatch: React.Dispatch<SkillPathAction>;
}

const SkillPathContext = createContext<SkillPathContextType | null>(null);

const STORAGE_KEY = "skillpath_ai_state_v1";

export function SkillPathProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(skillPathReducer, INITIAL_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.activeStage === "number") {
          // Re-hydrate saved state
          Object.keys(parsed).forEach((k) => {
            // keep valid keys
          });
        }
      }
    } catch (e) {
      // ignore parsing error
    }
    setHasHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (hasHydrated) {
      try {
        const toSave = {
          activeStage: state.activeStage,
          background: state.background,
          claims: state.claims,
          consentEnvelopes: state.consentEnvelopes,
          validatedSkills: state.validatedSkills,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [state, hasHydrated]);

  // Global keybinding: Alt+P to toggle Presenter Strip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_PRESENTER_STRIP" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SkillPathContext.Provider value={{ state, dispatch }}>
      {children}
    </SkillPathContext.Provider>
  );
}

export function useSkillPath() {
  const context = useContext(SkillPathContext);
  if (!context) {
    throw new Error("useSkillPath must be used within a SkillPathProvider");
  }
  return context;
}
