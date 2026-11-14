import {
  PROFICIENCY_RANK,
  type CareerGapMatrix,
  type CareerId,
  type QuestionItem,
  type SkillGapItem,
  type SkillValidationRecord,
} from "../schemas/domain.schema";
import { getCareerById, getQuestionsBySkill, getSkillById } from "../data-loader";

export interface CareerPivotResult {
  oldCareerId: CareerId;
  newCareerId: CareerId;
  transferredSkills: SkillValidationRecord[];
  contextualBridgeSkills: {
    skillId: string;
    skillName: string;
    missingCriticalTopics: string[];
    deltaQuestions: QuestionItem[];
  }[];
  unassessedNewSkills: string[];
  newCareerGapMatrix: CareerGapMatrix;
}

export function computeCareerGapMatrix(
  validatedSkills: SkillValidationRecord[],
  targetCareerId: CareerId,
  weeklyHours: number
): CareerGapMatrix {
  const career = getCareerById(targetCareerId);
  if (!career) {
    throw new Error(`Career with ID "${targetCareerId}" not found in catalogue.`);
  }

  const validatedMap = new Map<string, SkillValidationRecord>();
  for (const v of validatedSkills) {
    validatedMap.set(v.skillId, v);
  }

  const existingCapabilities: SkillGapItem[] = [];
  const improvementsNeeded: SkillGapItem[] = [];
  const newLearningNeeded: SkillGapItem[] = [];

  let totalWeightedRatio = 0;
  let totalWeight = 0;
  let totalEstimatedHours = 0;

  for (const req of career.requirements) {
    const skill = getSkillById(req.skillId);
    const skillName = skill?.name || req.skillId;
    const valRecord = validatedMap.get(req.skillId);

    const currentValidatedLevel = valRecord ? valRecord.validatedLevel : "none";
    const lVal = PROFICIENCY_RANK[currentValidatedLevel];
    const lReq = PROFICIENCY_RANK[req.requiredLevel];

    // Check critical weak topics
    const failedTopicTags = new Set(valRecord?.weakTopics.map((w) => w.topicTag) || []);
    const verifiedTopicTags = new Set(valRecord?.verifiedTopics || []);

    const hasFailedCriticalTopics = req.criticalTopicTags.some((tag) =>
      failedTopicTags.has(tag)
    );

    // Compute skill match ratio
    let matchRatio = Math.min(1.0, lVal / lReq);
    if (hasFailedCriticalTopics) {
      matchRatio = Math.max(0, matchRatio - 0.15);
    }

    totalWeightedRatio += req.weight * matchRatio;
    totalWeight += req.weight;

    // Missing critical topics: critical topics that are NOT verified
    const missingCriticalTopics = req.criticalTopicTags.filter(
      (tag) => !verifiedTopicTags.has(tag)
    );

    const levelDeficit = Math.max(0, lReq - lVal);
    const priorityScore =
      levelDeficit * req.weight * 10 + missingCriticalTopics.length * 5;

    // Classification
    let gapClassification: "existing_capability" | "improvement_needed" | "new_learning_needed";
    if (lVal >= lReq && !hasFailedCriticalTopics) {
      gapClassification = "existing_capability";
    } else if (lVal === 0) {
      gapClassification = "new_learning_needed";
    } else {
      gapClassification = "improvement_needed";
    }

    let itemHours = 0;
    if (gapClassification === "existing_capability") {
      itemHours = missingCriticalTopics.length > 0 ? 5 : 0;
      totalEstimatedHours += itemHours;
    } else if (gapClassification === "new_learning_needed") {
      itemHours = lReq * 25 + missingCriticalTopics.length * 5;
      totalEstimatedHours += itemHours;
    } else {
      itemHours = levelDeficit * 15 + missingCriticalTopics.length * 5;
      totalEstimatedHours += itemHours;
    }

    const readinessGain = Math.round((req.weight / totalWeight) * 100);

    const gapItem: SkillGapItem = {
      skillId: req.skillId,
      skillName,
      currentValidatedLevel,
      requiredLevel: req.requiredLevel,
      weight: req.weight,
      gapClassification,
      levelDeficit,
      missingCriticalTopics,
      priorityScore,
      estimatedHours: itemHours,
      readinessGain,
    };

    if (gapClassification === "existing_capability") {
      existingCapabilities.push(gapItem);
    } else if (gapClassification === "improvement_needed") {
      improvementsNeeded.push(gapItem);
    } else {
      newLearningNeeded.push(gapItem);
    }
  }

  // Sort priorityScore descending for improvements & new learning
  improvementsNeeded.sort((a, b) => b.priorityScore - a.priorityScore);
  newLearningNeeded.sort((a, b) => b.priorityScore - a.priorityScore);

  const overallReadinessScore =
    totalWeight > 0 ? Math.round((totalWeightedRatio / totalWeight) * 100) : 0;

  const validWeeklyHours = Math.max(1, weeklyHours || 10);
  const estimatedWeeksToReady = Math.ceil(totalEstimatedHours / validWeeklyHours);

  return {
    targetCareerId,
    targetCareerTitle: career.title,
    overallReadinessScore,
    existingCapabilities,
    improvementsNeeded,
    newLearningNeeded,
    estimatedTotalHoursToReady: totalEstimatedHours,
    estimatedWeeksToReady,
  };
}

export function computeCareerPivot(
  validatedSkills: SkillValidationRecord[],
  oldCareerId: CareerId,
  newCareerId: CareerId,
  weeklyHours: number
): CareerPivotResult {
  const newCareer = getCareerById(newCareerId);
  if (!newCareer) {
    throw new Error(`Target pivot career "${newCareerId}" not found in catalogue.`);
  }

  const validatedMap = new Map<string, SkillValidationRecord>();
  for (const v of validatedSkills) {
    validatedMap.set(v.skillId, v);
  }

  const transferredSkills: SkillValidationRecord[] = [];
  const contextualBridgeSkills: CareerPivotResult["contextualBridgeSkills"] = [];
  const unassessedNewSkills: string[] = [];

  for (const req of newCareer.requirements) {
    const val = validatedMap.get(req.skillId);

    if (!val || val.questionsAttempted === 0) {
      unassessedNewSkills.push(req.skillId);
      continue;
    }

    // Check which critical topics for the NEW career have been tested
    const testedTopics = new Set([
      ...val.verifiedTopics,
      ...val.weakTopics.map((w) => w.topicTag),
    ]);

    const missingCriticalTopics = req.criticalTopicTags.filter(
      (tag) => !testedTopics.has(tag)
    );

    if (missingCriticalTopics.length === 0) {
      // All critical topics for the new career were already tested
      transferredSkills.push(val);
    } else {
      // Validated in old career, but needs contextual bridge testing for new critical topics
      const allQuestions = getQuestionsBySkill(req.skillId);
      const deltaQuestions = allQuestions
        .filter((q) => missingCriticalTopics.includes(q.topicTag))
        .slice(0, 2);

      contextualBridgeSkills.push({
        skillId: req.skillId,
        skillName: val.skillName,
        missingCriticalTopics,
        deltaQuestions,
      });
    }
  }

  const newCareerGapMatrix = computeCareerGapMatrix(
    validatedSkills,
    newCareerId,
    weeklyHours
  );

  return {
    oldCareerId,
    newCareerId,
    transferredSkills,
    contextualBridgeSkills,
    unassessedNewSkills,
    newCareerGapMatrix,
  };
}

