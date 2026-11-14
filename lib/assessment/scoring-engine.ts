import {
  COGNITIVE_WEIGHT,
  PROFICIENCY_RANK,
  type CalibrationState,
  type ConfidenceLevel,
  type ProficiencyLevel,
  type SelfReportedSkillClaim,
  type SkillValidationRecord,
  type TriangulatedArchetype,
  type WeakTopicRecord,
} from "../schemas/domain.schema";
import { getQuestionsCatalogue, getSkillById } from "../data-loader";

export interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
  timeSpentMs?: number;
}

export interface PlatformSignalMeta {
  repoCount?: number;
  certCount?: number;
  evidenceSource?: string;
}

export function scoreSkillAssessment(
  claims: SelfReportedSkillClaim[],
  submittedAnswers: SubmittedAnswer[],
  platformSignals?: Record<string, PlatformSignalMeta>
): SkillValidationRecord[] {
  const allQuestions = getQuestionsCatalogue();
  const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
  const answerMap = new Map(submittedAnswers.map((a) => [a.questionId, a]));

  const records: SkillValidationRecord[] = [];

  for (const claim of claims) {
    const skill = getSkillById(claim.skillId);
    const skillName = skill?.name || claim.skillId;
    const selfReportedLevel = claim.claimedLevel;
    const signal = platformSignals ? platformSignals[claim.skillId] : undefined;

    // Filter questions attempted for this skill
    const attemptedForSkill = allQuestions.filter(
      (q) => q.skillId === claim.skillId && answerMap.has(q.id)
    );

    const questionsAttempted = attemptedForSkill.length;

    if (questionsAttempted === 0) {
      records.push({
        skillId: claim.skillId,
        skillName,
        selfReportedLevel,
        validatedLevel: "none",
        assessmentScore: 0,
        calibrationState: "unverified",
        calibrationDelta: 0 - PROFICIENCY_RANK[selfReportedLevel],
        confidence: "low",
        triangulatedArchetype: "unverified_claim",
        questionsAttempted: 0,
        verifiedTopics: [],
        weakTopics: [],
        evidenceSummary: `No assessment questions attempted for ${skillName}. Marked unverified.`,
        platformEvidence: signal?.evidenceSource ? [signal.evidenceSource] : [],
        rapidGuessDetected: false,
      });
      continue;
    }

    let weightedSum = 0;
    let totalWeight = 0;
    const verifiedTopicSet = new Set<string>();
    const weakTopics: WeakTopicRecord[] = [];

    let passedAdvanced = false;
    let passedIntermediate = false;
    let passedSyntaxRecall = false;
    let failedSyntaxRecall = false;
    let passedScenarioDebugging = false;

    let rapidGuessDetected = false;
    let totalTimeSpent = 0;
    let timedQuestionsCount = 0;

    for (const q of attemptedForSkill) {
      const ans = answerMap.get(q.id)!;
      const isCorrect = ans.selectedIndex === q.correctIndex;
      const weight = COGNITIVE_WEIGHT[q.cognitiveTier];
      totalWeight += weight;

      if (ans.timeSpentMs !== undefined) {
        totalTimeSpent += ans.timeSpentMs;
        timedQuestionsCount++;
        // Flag rapid guess if intermediate/advanced answered in under 4000ms
        if ((q.difficulty === "intermediate" || q.difficulty === "advanced") && ans.timeSpentMs < 4000) {
          rapidGuessDetected = true;
        }
      }

      if (isCorrect) {
        weightedSum += weight * 1;
        verifiedTopicSet.add(q.topicTag);

        if (q.difficulty === "advanced") passedAdvanced = true;
        if (q.difficulty === "intermediate") passedIntermediate = true;
        if (q.cognitiveTier === "syntax_recall") passedSyntaxRecall = true;
        if (q.cognitiveTier === "scenario_debugging") passedScenarioDebugging = true;
      } else {
        weakTopics.push({
          topicTag: q.topicTag,
          failedCognitiveTier: q.cognitiveTier,
          questionId: q.id,
        });

        if (q.cognitiveTier === "syntax_recall") {
          failedSyntaxRecall = true;
        }
      }
    }

    const assessmentScore =
      totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    // Determine Validated Proficiency
    let validatedLevel: ProficiencyLevel = "none";
    if (assessmentScore >= 80) {
      if (passedAdvanced) {
        validatedLevel = "advanced";
      } else if (passedIntermediate) {
        validatedLevel = "intermediate";
      } else {
        validatedLevel = "beginner";
      }
    } else if (assessmentScore >= 50) {
      validatedLevel = "beginner";
    } else {
      if (assessmentScore >= 25 || passedSyntaxRecall) {
        validatedLevel = "beginner";
      } else {
        validatedLevel = "none";
      }
    }

    // Calibration Delta & State
    const calibrationDelta =
      PROFICIENCY_RANK[validatedLevel] - PROFICIENCY_RANK[selfReportedLevel];
    let calibrationState: CalibrationState;
    if (calibrationDelta < 0) {
      calibrationState = "overconfident";
    } else if (calibrationDelta === 0) {
      calibrationState = "calibrated";
    } else {
      calibrationState = "underconfident";
    }

    // Tier Inversion Anomaly & Confidence Formula
    const hasInversion = passedScenarioDebugging && failedSyntaxRecall;
    const uniqueTopicsCovered = new Set(attemptedForSkill.map((q) => q.topicTag)).size;

    let confidence: ConfidenceLevel = "low";
    if (questionsAttempted < 3 || uniqueTopicsCovered < 2) {
      // Enforce low confidence if <3 questions answered or <2 micro-topics covered
      confidence = "low";
    } else if (hasInversion || rapidGuessDetected) {
      // Rapid guess anomaly or cognitive tier inversion caps confidence at medium
      confidence = "medium";
    } else if (assessmentScore >= 40) {
      confidence = "high";
    } else {
      confidence = "medium";
    }

    // 3-Vector Triangulation Archetype assignment
    const repoCount = signal?.repoCount || 0;
    const certCount = signal?.certCount || 0;
    let triangulatedArchetype: TriangulatedArchetype = "calibrated_learner";

    if (repoCount >= 2 && assessmentScore >= 75) {
      triangulatedArchetype = "verified_practitioner";
    } else if (repoCount >= 2 && assessmentScore < 60) {
      triangulatedArchetype = "tutorial_cloner";
    } else if (certCount >= 1 && assessmentScore < 60) {
      triangulatedArchetype = "certificate_collector";
    } else if (repoCount === 0 && assessmentScore >= 75 && selfReportedLevel !== "none") {
      triangulatedArchetype = "portfolio_starved_theorist";
    } else if (calibrationDelta > 0 && assessmentScore >= 75) {
      triangulatedArchetype = "hidden_practitioner";
    } else if (calibrationDelta < 0 && assessmentScore < 60) {
      triangulatedArchetype = "overconfident_novice";
    } else {
      triangulatedArchetype = "calibrated_learner";
    }

    const verifiedTopics = Array.from(verifiedTopicSet);
    const averageTimeSpentMs =
      timedQuestionsCount > 0 ? Math.round(totalTimeSpent / timedQuestionsCount) : undefined;

    const evidenceSummary =
      `Scored ${assessmentScore}% across ${questionsAttempted} question(s) with ${confidence} confidence. ` +
      `Validated: ${validatedLevel} (Claimed: ${selfReportedLevel}, Delta: ${calibrationDelta}). ` +
      `Archetype: ${triangulatedArchetype}. ` +
      (rapidGuessDetected ? "Rapid response anomaly detected (<4s on intermediate/advanced). " : "") +
      (hasInversion ? "Tier inversion detected (passed scenario debugging but missed syntax recall). " : "") +
      `Verified: [${verifiedTopics.join(", ")}]. Weak: [${weakTopics.map((w) => w.topicTag).join(", ")}].`;

    const platformEvidence: string[] = [];
    if (signal?.evidenceSource) {
      platformEvidence.push(signal.evidenceSource);
    }

    records.push({
      skillId: claim.skillId,
      skillName,
      selfReportedLevel,
      validatedLevel,
      assessmentScore,
      calibrationState,
      calibrationDelta,
      confidence,
      triangulatedArchetype,
      questionsAttempted,
      verifiedTopics,
      weakTopics,
      evidenceSummary,
      platformEvidence,
      rapidGuessDetected,
      averageTimeSpentMs,
    });
  }

  return records;
}
