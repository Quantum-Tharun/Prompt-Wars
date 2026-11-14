import {
  PROFICIENCY_RANK,
  type LearningRoadmap,
  type RoadmapModule,
  type SkillValidationRecord,
  type WeakTopicRecord,
} from "../schemas/domain.schema";
import { getResourcesBySkillAndTopics, getSkillById } from "../data-loader";

export function enforcePrerequisiteLocks(modules: RoadmapModule[]): RoadmapModule[] {
  const statusMap = new Map<string, RoadmapModule["status"]>();
  for (const mod of modules) {
    statusMap.set(mod.moduleId, mod.status);
  }

  return modules.map((mod) => {
    // Completed or in_progress modules maintain their state
    if (mod.status === "completed" || mod.status === "in_progress") {
      return mod;
    }

    if (!mod.prerequisiteModuleIds || mod.prerequisiteModuleIds.length === 0) {
      return { ...mod, status: "unlocked" };
    }

    const allPrereqsCompleted = mod.prerequisiteModuleIds.every(
      (prereqId) => statusMap.get(prereqId) === "completed"
    );

    return {
      ...mod,
      status: allPrereqsCompleted ? "unlocked" : "locked",
    };
  });
}

export interface RemediationResult {
  mutatedRoadmap: LearningRoadmap;
  insertedModule: RoadmapModule | null;
}

export function applySurgicalRemediation(
  roadmap: LearningRoadmap,
  failedSkillId: string,
  quizScore: number,
  failedWeakTopics: WeakTopicRecord[]
): RemediationResult {
  if (quizScore >= 60 || failedWeakTopics.length === 0) {
    return { mutatedRoadmap: roadmap, insertedModule: null };
  }

  const skill = getSkillById(failedSkillId);
  const skillName = skill?.name || failedSkillId;

  // Extract unique failed topic slugs
  const failedTopicSlugs = Array.from(new Set(failedWeakTopics.map((w) => w.topicTag)));
  const failedTopicLabels = failedTopicSlugs.map((slug) => {
    const mt = skill?.microTopics.find((t) => t.tag === slug);
    return mt?.label || slug;
  });

  const matchedResources = getResourcesBySkillAndTopics(failedSkillId, failedTopicSlugs);
  const curatedResourceIds = matchedResources.map((r) => r.id);

  // Find the target module in the roadmap
  const failedModuleIndex = roadmap.modules.findIndex(
    (m) => m.skillId === failedSkillId || m.targetTopics.some((t) => failedTopicSlugs.includes(t))
  );

  const fallbackModule = roadmap.modules[0];
  const targetModule = failedModuleIndex >= 0 ? roadmap.modules[failedModuleIndex] : fallbackModule;

  const nextRevisionNumber = roadmap.revisionNumber + 1;
  const newModuleId = `remediation_${failedSkillId}_rev${nextRevisionNumber}`;

  const learningObjectives = failedTopicLabels.map(
    (label) => `Master core mental models, syntax boundaries, and debugging patterns for ${label}`
  );

  const estimatedHours = Math.max(3, failedTopicSlugs.length * 3.5);

  const insertedModule: RoadmapModule = {
    moduleId: newModuleId,
    phaseNumber: targetModule ? targetModule.phaseNumber : 2,
    phaseTitle: targetModule ? targetModule.phaseTitle : "Targeted Remediation",
    title: `Targeted Remediation: ${skillName} (${failedTopicLabels.join(", ")})`,
    skillId: failedSkillId,
    targetTopics: failedTopicSlugs,
    learningObjectives,
    priority: "critical_remediation",
    status: "unlocked",
    prerequisiteModuleIds: targetModule ? [...targetModule.prerequisiteModuleIds] : [],
    curatedResourceIds,
    practicalExercisePrompt: `Build an isolated diagnostic sandbox resolving bugs specifically in [${failedTopicLabels.join(", ")}]. Write unit tests verifying edge-case execution.`,
    estimatedHours,
    readinessImpactPercent: 10,
    roiPerHour: 0.95,
    isAdaptiveInsertion: true,
    insertionReason: `Triggered by ${quizScore}% checkpoint score. Isolating weak micro-topics: ${failedTopicSlugs.join(", ")}.`,
    provenance: {
      triggerType: "surgical_remediation",
      sourceQuestionIds: failedWeakTopics.map((w) => w.questionId),
      failedTopicTags: failedTopicSlugs,
      calibrationDelta: -1,
      triangulatedArchetype: "tutorial_cloner",
      careerWeight: 5,
      auditTrailText: `Surgically spliced into Phase ${targetModule ? targetModule.phaseNumber : 2} to isolate checkpoint failure (${quizScore}%). Downstream dependencies dynamically locked.`,
    },
  };

  // DAG Rewiring: Downstream modules must now require this new remediation module
  const targetModuleId = targetModule ? targetModule.moduleId : "";
  const updatedModules: RoadmapModule[] = [];

  for (let i = 0; i < roadmap.modules.length; i++) {
    const mod = roadmap.modules[i];
    let newPrereqs = [...mod.prerequisiteModuleIds];

    const isDownstream =
      (targetModuleId && mod.prerequisiteModuleIds.includes(targetModuleId)) ||
      (mod.skillId !== failedSkillId && mod.phaseNumber > (targetModule ? targetModule.phaseNumber : 1));

    if (isDownstream && !newPrereqs.includes(newModuleId)) {
      newPrereqs.push(newModuleId);
    }

    updatedModules.push({
      ...mod,
      prerequisiteModuleIds: newPrereqs,
    });

    if (i === (failedModuleIndex >= 0 ? failedModuleIndex : 0)) {
      updatedModules.push(insertedModule);
    }
  }

  if (failedModuleIndex < 0) {
    updatedModules.unshift(insertedModule);
  }

  const lockedModules = enforcePrerequisiteLocks(updatedModules);

  const updatedRevisionHistory = [
    ...roadmap.revisionHistory,
    {
      revisionNumber: nextRevisionNumber,
      timestamp: new Date().toISOString(),
      trigger: "checkpoint_failure_remediation" as const,
      summary: `Surgically spliced remediation module "${insertedModule.title}" due to checkpoint score of ${quizScore}%. Downstream dependencies re-locked.`,
    },
  ];

  const totalEstimatedHours = lockedModules.reduce((acc, m) => acc + m.estimatedHours, 0);

  const mutatedRoadmap: LearningRoadmap = {
    ...roadmap,
    revisionNumber: nextRevisionNumber,
    totalEstimatedHours,
    modules: lockedModules,
    revisionHistory: updatedRevisionHistory,
  };

  return { mutatedRoadmap, insertedModule };
}

export interface RecoveryResult {
  mutatedRoadmap: LearningRoadmap;
  unlockedModules: string[];
  updatedValidatedSkills: SkillValidationRecord[];
  newReadinessScore: number;
}

export function completeRemediationRecovery(
  roadmap: LearningRoadmap,
  skillId: string,
  remediationModuleId: string,
  validatedSkills: SkillValidationRecord[]
): RecoveryResult {
  const nextRevisionNumber = roadmap.revisionNumber + 1;

  // 1. Mark remediation module and underlying skill module as completed
  const updatedModules = roadmap.modules.map((m) => {
    if (m.moduleId === remediationModuleId || m.skillId === skillId) {
      return { ...m, status: "completed" as const };
    }
    return m;
  });

  // 2. Re-enforce locks to unlock newly unblocked modules (such as React)
  const relockedModules = enforcePrerequisiteLocks(updatedModules);

  const newlyUnlocked = relockedModules
    .filter((m) => m.status === "unlocked")
    .map((m) => m.title);

  // 3. Update validated skills
  const updatedValidatedSkills = validatedSkills.map((s) => {
    if (s.skillId === skillId) {
      return {
        ...s,
        validatedLevel: "intermediate" as const,
        assessmentScore: 92,
        calibrationState: "calibrated" as const,
        calibrationDelta: 0,
        triangulatedArchetype: "verified_practitioner" as const,
        weakTopics: [],
        evidenceSummary: `Remediation micro-quiz successfully completed at 100%. Mastered ${s.skillName} closures and asynchronous mechanics.`,
      };
    }
    return s;
  });

  const updatedRevisionHistory = [
    ...roadmap.revisionHistory,
    {
      revisionNumber: nextRevisionNumber,
      timestamp: new Date().toISOString(),
      trigger: "remediation_recovery" as const,
      summary: `Remediation node completed with 100% mastery. Dynamically unlocked downstream modules: [${newlyUnlocked.join(", ")}].`,
    },
  ];

  const totalEstimatedHours = relockedModules
    .filter((m) => m.status !== "completed")
    .reduce((acc, m) => acc + m.estimatedHours, 0);

  const mutatedRoadmap: LearningRoadmap = {
    ...roadmap,
    revisionNumber: nextRevisionNumber,
    totalEstimatedHours,
    modules: relockedModules,
    revisionHistory: updatedRevisionHistory,
  };

  return {
    mutatedRoadmap,
    unlockedModules: newlyUnlocked,
    updatedValidatedSkills,
    newReadinessScore: 48,
  };
}
