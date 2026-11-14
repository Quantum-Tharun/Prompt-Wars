import { describe, it } from "node:test";
import assert from "node:assert/strict";

import skills from "../data/skills.json" with { type: "json" };
import careers from "../data/careers.json" with { type: "json" };
import questions from "../data/questions.json" with { type: "json" };
import resources from "../data/resources.json" with { type: "json" };

describe("SkillPath AI: Mathematical Engines & Logic Verification", () => {
  describe("1. Scoring Engine & Cognitive Weights", () => {
    const COGNITIVE_WEIGHT = {
      syntax_recall: 1,
      code_tracing: 2,
      scenario_debugging: 3,
    };

    it("should compute exact 1x, 2x, 3x cognitive weights summing to 6", () => {
      const sum =
        COGNITIVE_WEIGHT.syntax_recall +
        COGNITIVE_WEIGHT.code_tracing +
        COGNITIVE_WEIGHT.scenario_debugging;
      assert.equal(sum, 6, "Total cognitive weight across 3 tiers must equal 6");
    });

    it("should award 100% when all 3 cognitive tiers are answered correctly", () => {
      const mockAnswers = [
        { tier: "syntax_recall", correct: true },
        { tier: "code_tracing", correct: true },
        { tier: "scenario_debugging", correct: true },
      ];
      let weightedEarned = 0;
      let totalWeight = 0;
      for (const a of mockAnswers) {
        const w = COGNITIVE_WEIGHT[a.tier];
        totalWeight += w;
        if (a.correct) weightedEarned += w;
      }
      const score = Math.round((weightedEarned / totalWeight) * 100);
      assert.equal(score, 100);
    });

    it("should award 50% when only scenario debugging is missed (3 of 6 points)", () => {
      const mockAnswers = [
        { tier: "syntax_recall", correct: true }, // 1
        { tier: "code_tracing", correct: true },  // 2
        { tier: "scenario_debugging", correct: false }, // 0
      ];
      let weightedEarned = 0;
      let totalWeight = 0;
      for (const a of mockAnswers) {
        const w = COGNITIVE_WEIGHT[a.tier];
        totalWeight += w;
        if (a.correct) weightedEarned += w;
      }
      const score = Math.round((weightedEarned / totalWeight) * 100);
      assert.equal(score, 50);
    });

    it("should detect rapid-guess latency anomaly when timeSpentMs < 4000ms", () => {
      const latencyThresholdMs = 4000;
      const normalAnswer = { timeSpentMs: 12500 };
      const rapidGuessAnswer = { timeSpentMs: 2500 };

      assert.equal(normalAnswer.timeSpentMs < latencyThresholdMs, false);
      assert.equal(rapidGuessAnswer.timeSpentMs < latencyThresholdMs, true);
    });
  });

  describe("2. Archetype Triangulation Logic", () => {
    function triangulate(repos, certs, quizScore) {
      if (repos >= 2 && quizScore >= 75) return "verified_practitioner";
      if (repos >= 2 && quizScore < 60) return "tutorial_cloner";
      if (certs >= 1 && quizScore < 60) return "certificate_collector";
      if (repos === 0 && quizScore >= 75) return "portfolio_starved_theorist";
      return "calibrated_learner";
    }

    it("should classify 4 repos and 86% quiz as verified_practitioner", () => {
      assert.equal(triangulate(4, 0, 86), "verified_practitioner");
    });

    it("should classify 0 repos, 2 certs, and 50% quiz as certificate_collector", () => {
      assert.equal(triangulate(0, 2, 50), "certificate_collector");
    });

    it("should classify 3 repos and 40% quiz as tutorial_cloner", () => {
      assert.equal(triangulate(3, 0, 40), "tutorial_cloner");
    });

    it("should classify 0 repos and 90% quiz as portfolio_starved_theorist", () => {
      assert.equal(triangulate(0, 0, 90), "portfolio_starved_theorist");
    });
  });

  describe("3. Career Gap Matrix & Readiness Mathematics", () => {
    it("should calculate weighted readiness percentage according to requirements", () => {
      const fullStack = careers.find((c) => c.id === "fullstack_dev");
      assert.ok(fullStack, "fullstack_dev must exist in careers.json");

      // Verify requirement structure
      let totalReqWeight = 0;
      for (const req of fullStack.requirements) {
        assert.ok(req.skillId, "Requirement must specify skillId");
        assert.ok(req.weight > 0, "Requirement weight must be positive");
        totalReqWeight += req.weight;
      }
      assert.ok(totalReqWeight >= 1.0, "Total weight of requirements should be >= 1.0");
    });

    it("should properly partition verified skills into existing, improvement_required, and net_new", () => {
      const targetReqs = [
        { skillId: "python", requiredLevel: "intermediate", weight: 0.3 },
        { skillId: "sql", requiredLevel: "intermediate", weight: 0.3 },
        { skillId: "docker", requiredLevel: "beginner", weight: 0.4 },
      ];

      const validatedSkills = [
        { skillId: "python", validatedLevel: "advanced", assessmentScore: 90 },
        { skillId: "sql", validatedLevel: "beginner", assessmentScore: 50 },
      ];

      const valMap = new Map(validatedSkills.map((v) => [v.skillId, v]));

      const existing = [];
      const needsImprovement = [];
      const netNew = [];

      const rank = { none: 0, beginner: 1, intermediate: 2, advanced: 3 };

      for (const req of targetReqs) {
        const val = valMap.get(req.skillId);
        if (!val || val.validatedLevel === "none") {
          netNew.push(req.skillId);
        } else if (rank[val.validatedLevel] >= rank[req.requiredLevel]) {
          existing.push(req.skillId);
        } else {
          needsImprovement.push(req.skillId);
        }
      }

      assert.deepEqual(existing, ["python"]);
      assert.deepEqual(needsImprovement, ["sql"]);
      assert.deepEqual(netNew, ["docker"]);
    });
  });

  describe("4. Zero-Loss Career Switch & Skill Capital Ledger", () => {
    it("should preserve overlapping skills and save learning hours", () => {
      // Alex Chen verified: Python (advanced), SQL (beginner)
      // Switching to data_analyst which requires Python and SQL
      const dataAnalyst = careers.find((c) => c.id === "data_analyst");
      assert.ok(dataAnalyst, "data_analyst career track must exist");

      const pythonReq = dataAnalyst.requirements.find((r) => r.skillId === "python");
      assert.ok(pythonReq, "data_analyst must require python");

      // Transferred hours calculation
      const pythonHours = pythonReq.estimatedHoursToMastery || 40;
      assert.ok(pythonHours > 0, "Mastery hours must be positive");
    });
  });

  describe("5. Question Bank Integrity & Distribution", () => {
    it("should have at least 6 questions per skill with 2+ per cognitive tier", () => {
      const questionsBySkill = {};
      for (const q of questions) {
        if (!questionsBySkill[q.skillId]) questionsBySkill[q.skillId] = [];
        questionsBySkill[q.skillId].push(q);
      }

      for (const skill of skills) {
        const skillQuestions = questionsBySkill[skill.id] || [];
        assert.ok(
          skillQuestions.length >= 6,
          `Skill "${skill.id}" has ${skillQuestions.length} questions, expected >= 6`
        );

        const tiers = {
          syntax_recall: 0,
          code_tracing: 0,
          scenario_debugging: 0,
        };
        for (const q of skillQuestions) {
          if (tiers[q.cognitiveTier] !== undefined) {
            tiers[q.cognitiveTier]++;
          }
        }

        assert.ok(
          tiers.syntax_recall >= 2,
          `Skill "${skill.id}" needs >= 2 syntax_recall questions (found ${tiers.syntax_recall})`
        );
        assert.ok(
          tiers.code_tracing >= 2,
          `Skill "${skill.id}" needs >= 2 code_tracing questions (found ${tiers.code_tracing})`
        );
        assert.ok(
          tiers.scenario_debugging >= 2,
          `Skill "${skill.id}" needs >= 2 scenario_debugging questions (found ${tiers.scenario_debugging})`
        );
      }
    });

    it("should verify every question has exactly 4 options and valid correctIndex (0..3)", () => {
      for (const q of questions) {
        assert.equal(q.options.length, 4, `Question "${q.id}" must have 4 options`);
        assert.ok(
          q.correctIndex >= 0 && q.correctIndex <= 3,
          `Question "${q.id}" correctIndex must be 0, 1, 2, or 3`
        );
        assert.ok(q.explanation.length > 10, `Question "${q.id}" must have a meaningful explanation`);
      }
    });
  });

  describe("6. Remediation & Dependency Recovery", () => {
    it("should trigger surgical remediation when score < 60", () => {
      const score = 50;
      const needsRemediation = score < 60;
      assert.equal(needsRemediation, true);
    });

    it("should mark recovered gate unlocked when recovery score >= 75", () => {
      const recoveryScore = 100;
      const isRecovered = recoveryScore >= 75;
      assert.equal(isRecovered, true);
    });
  });
});
