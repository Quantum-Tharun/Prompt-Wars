import fs from "fs";
import path from "path";

const skillsPath = path.resolve("data/skills.json");
const questionsPath = path.resolve("data/questions.json");

const skills = JSON.parse(fs.readFileSync(skillsPath, "utf-8"));
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

console.log(`Auditing ${questions.length} questions across ${skills.length} canonical skills...`);

const validSkillIds = new Set(skills.map((s) => s.id));
const validTopicTags = new Set(
  skills.flatMap((s) => s.microTopics.map((m) => m.tag))
);

const validTiers = new Set([
  "syntax_recall",
  "code_tracing",
  "scenario_debugging",
]);

const validDifficulties = new Set(["beginner", "intermediate", "advanced"]);

let errors = [];
const seenIds = new Set();
const bySkill = {};

for (const q of questions) {
  // Check ID uniqueness
  if (!q.id || seenIds.has(q.id)) {
    errors.push(`Duplicate or missing question ID: ${q.id}`);
  }
  seenIds.add(q.id);

  // Check skillId
  if (!validSkillIds.has(q.skillId)) {
    errors.push(`Invalid skillId "${q.skillId}" in question ${q.id}`);
  }

  // Check topicTag
  if (!validTopicTags.has(q.topicTag)) {
    errors.push(
      `Invalid topicTag "${q.topicTag}" for skill "${q.skillId}" in question ${q.id}`
    );
  }

  // Check tier
  if (!validTiers.has(q.cognitiveTier)) {
    errors.push(`Invalid cognitiveTier "${q.cognitiveTier}" in question ${q.id}`);
  }

  // Check difficulty
  if (!validDifficulties.has(q.difficulty)) {
    errors.push(`Invalid difficulty "${q.difficulty}" in question ${q.id}`);
  }

  // Check options
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`Question ${q.id} must have exactly 4 options`);
  } else {
    const distinct = new Set(q.options);
    if (distinct.size !== 4) {
      errors.push(`Question ${q.id} has duplicate options: ${JSON.stringify(q.options)}`);
    }
  }

  // Check correctIndex
  if (
    typeof q.correctIndex !== "number" ||
    q.correctIndex < 0 ||
    q.correctIndex > 3
  ) {
    errors.push(`Question ${q.id} has invalid correctIndex: ${q.correctIndex}`);
  }

  // Check explanation
  if (!q.explanation || typeof q.explanation !== "string" || q.explanation.length < 10) {
    errors.push(`Question ${q.id} is missing a comprehensive explanation`);
  }

  // Tally by skill
  if (!bySkill[q.skillId]) {
    bySkill[q.skillId] = {
      total: 0,
      syntax_recall: 0,
      code_tracing: 0,
      scenario_debugging: 0,
    };
  }
  bySkill[q.skillId].total++;
  bySkill[q.skillId][q.cognitiveTier]++;
}

// Check coverage: each skill must have >= 6 questions, with >= 2 in each tier
for (const skill of skills) {
  const stats = bySkill[skill.id];
  if (!stats) {
    errors.push(`Skill "${skill.id}" has 0 questions in bank!`);
    continue;
  }
  if (stats.total < 6) {
    errors.push(`Skill "${skill.id}" has only ${stats.total} questions (required: >= 6)`);
  }
  if (stats.syntax_recall < 2) {
    errors.push(
      `Skill "${skill.id}" has only ${stats.syntax_recall} syntax_recall questions (required: >= 2)`
    );
  }
  if (stats.code_tracing < 2) {
    errors.push(
      `Skill "${skill.id}" has only ${stats.code_tracing} code_tracing questions (required: >= 2)`
    );
  }
  if (stats.scenario_debugging < 2) {
    errors.push(
      `Skill "${skill.id}" has only ${stats.scenario_debugging} scenario_debugging questions (required: >= 2)`
    );
  }
}

if (errors.length > 0) {
  console.error(`Validation FAILED with ${errors.length} error(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`Validation PASSED! All ${questions.length} questions strictly verified across all 11 skills.`);
  console.log("Skill breakdown:", bySkill);
  process.exit(0);
}
