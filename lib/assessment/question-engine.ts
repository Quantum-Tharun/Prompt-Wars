import {
  PROFICIENCY_RANK,
  type CareerId,
  type ProficiencyLevel,
  type QuestionItem,
  type SelfReportedSkillClaim,
} from "../schemas/domain.schema";
import { getCareerById, getQuestionsBySkill } from "../data-loader";

export type PublicQuestionItem = Omit<QuestionItem, "correctIndex" | "explanation">;

export function stripAnswerKeys(questions: QuestionItem[]): PublicQuestionItem[] {
  return questions.map(({ correctIndex: _ci, explanation: _exp, ...rest }) => rest);
}

export interface AdaptiveStaircaseResult {
  questionsBySkill: Record<string, QuestionItem[]>;
  allQuestions: QuestionItem[];
}

export function generateAdaptiveStaircase(
  claims: SelfReportedSkillClaim[],
  targetCareerId: CareerId,
  footprintLevels?: Record<string, ProficiencyLevel>
): AdaptiveStaircaseResult {
  const career = getCareerById(targetCareerId);
  const questionsBySkill: Record<string, QuestionItem[]> = {};
  const allQuestions: QuestionItem[] = [];

  for (const claim of claims) {
    if (claim.claimedLevel === "none") {
      continue;
    }

    const skillQuestions = getQuestionsBySkill(claim.skillId);
    if (skillQuestions.length === 0) {
      continue;
    }

    const req = career?.requirements.find((r) => r.skillId === claim.skillId);
    const criticalTopicTags = req?.criticalTopicTags || [];

    const claimedRank = PROFICIENCY_RANK[claim.claimedLevel];
    const footprintLevel = footprintLevels ? footprintLevels[claim.skillId] : undefined;
    const footprintRank = footprintLevel ? PROFICIENCY_RANK[footprintLevel] : claimedRank;

    // Prior Rank computation incorporating footprint evidence
    const priorRankNum = footprintLevel
      ? Math.max(1, Math.round(0.4 * claimedRank + 0.6 * footprintRank))
      : claimedRank;

    const rankToDifficulty: Record<number, "beginner" | "intermediate" | "advanced"> = {
      1: "beginner",
      2: "intermediate",
      3: "advanced",
    };
    const calibratedAnchorDifficulty = rankToDifficulty[priorRankNum] || "beginner";

    const selected: QuestionItem[] = [];
    const usedIds = new Set<string>();

    // 1. Question 1 (Anchor Check): Difficulty matching calibrated priorRank
    const q1Candidates = skillQuestions.filter(
      (q) => !usedIds.has(q.id) && q.difficulty === calibratedAnchorDifficulty
    );
    q1Candidates.sort((a, b) => {
      const score = (q: QuestionItem) =>
        q.cognitiveTier === "code_tracing" ? 3 : q.cognitiveTier === "scenario_debugging" ? 2 : 1;
      return score(b) - score(a);
    });

    const q1 = q1Candidates[0] || skillQuestions.find((q) => !usedIds.has(q.id));
    if (q1) {
      selected.push(q1);
      usedIds.add(q1.id);
    }

    // 2. Question 2 (Boundary/Ceiling Check):
    const targetDifficulty = calibratedAnchorDifficulty === "beginner" ? "intermediate" : "advanced";
    const q2Candidates = skillQuestions.filter(
      (q) => !usedIds.has(q.id) && q.difficulty === targetDifficulty
    );
    q2Candidates.sort((a, b) => {
      const score = (q: QuestionItem) =>
        q.cognitiveTier === "syntax_recall" ? 3 : q.cognitiveTier === "code_tracing" ? 2 : 1;
      return score(b) - score(a);
    });

    const q2 =
      q2Candidates[0] ||
      skillQuestions.find(
        (q) => !usedIds.has(q.id) && (q.difficulty === "advanced" || q.difficulty === "intermediate")
      ) ||
      skillQuestions.find((q) => !usedIds.has(q.id));

    if (q2) {
      selected.push(q2);
      usedIds.add(q2.id);
    }

    // 3. Question 3 (Career-Critical Boundary Diagnostic):
    const selectedTags = new Set(selected.map((s) => s.topicTag));
    const q3Candidates = skillQuestions.filter(
      (q) => !usedIds.has(q.id) && criticalTopicTags.includes(q.topicTag)
    );
    q3Candidates.sort((a, b) => {
      const aUnseen = !selectedTags.has(a.topicTag) ? 2 : 1;
      const bUnseen = !selectedTags.has(b.topicTag) ? 2 : 1;
      return bUnseen - aUnseen;
    });

    const q3 =
      q3Candidates[0] ||
      skillQuestions.find((q) => !usedIds.has(q.id) && !selectedTags.has(q.topicTag)) ||
      skillQuestions.find((q) => !usedIds.has(q.id));

    if (q3) {
      selected.push(q3);
      usedIds.add(q3.id);
    }

    questionsBySkill[claim.skillId] = selected;
    allQuestions.push(...selected);
  }

  return { questionsBySkill, allQuestions };
}
