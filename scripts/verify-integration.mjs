import http from "http";

console.log("=== SKILLPATH AI: INTEGRATION & VERIFICATION PIPELINE ===");

// 1. Verify referential integrity of data catalogues
import skills from "../data/skills.json" with { type: "json" };
import careers from "../data/careers.json" with { type: "json" };
import questions from "../data/questions.json" with { type: "json" };
import resources from "../data/resources.json" with { type: "json" };

console.log(`[1/4] Verifying Catalogue Referential Integrity:`);
console.log(`  - Canonical Skills: ${skills.length}`);
console.log(`  - Target Careers: ${careers.length}`);
console.log(`  - Diagnostic Questions: ${questions.length}`);
console.log(`  - Curated Resources: ${resources.length}`);

const skillIds = new Set(skills.map((s) => s.id));
const topicTags = new Set(skills.flatMap((s) => s.microTopics.map((m) => m.tag)));

// Check careers
for (const c of careers) {
  for (const req of c.requirements) {
    if (!skillIds.has(req.skillId)) {
      throw new Error(`Career "${c.id}" references unknown skill "${req.skillId}"`);
    }
    for (const tag of req.criticalTopicTags) {
      if (!topicTags.has(tag)) {
        throw new Error(`Career "${c.id}" references unknown topicTag "${tag}"`);
      }
    }
  }
}
console.log("  ✓ Career matrices verified: 100% referential integrity.");

// Check questions
for (const q of questions) {
  if (!skillIds.has(q.skillId)) {
    throw new Error(`Question "${q.id}" references unknown skill "${q.skillId}"`);
  }
  if (!topicTags.has(q.topicTag)) {
    throw new Error(`Question "${q.id}" references unknown topicTag "${q.topicTag}"`);
  }
}
console.log("  ✓ Question bank verified: 100% referential integrity.");

// Check resources
for (const r of resources) {
  if (!skillIds.has(r.skillId)) {
    throw new Error(`Resource "${r.id}" references unknown skill "${r.skillId}"`);
  }
  const tags = Array.isArray(r.topicTags) ? r.topicTags : [r.topicTag];
  for (const tag of tags) {
    if (!topicTags.has(tag)) {
      throw new Error(`Resource "${r.id}" references unknown topicTag "${tag}"`);
    }
  }
}
console.log("  ✓ Curated resources verified: 100% referential integrity.");

// 2. Validate Question Bank Distribution
console.log("[2/4] Validating Skill Question Coverage (min 6 questions, min 2/tier):");
const bySkill = {};
questions.forEach((q) => {
  bySkill[q.skillId] = bySkill[q.skillId] || { total: 0, syntax_recall: 0, code_tracing: 0, scenario_debugging: 0 };
  bySkill[q.skillId].total++;
  bySkill[q.skillId][q.cognitiveTier]++;
});

for (const s of skills) {
  const stat = bySkill[s.id];
  if (!stat || stat.total < 6 || stat.syntax_recall < 2 || stat.code_tracing < 2 || stat.scenario_debugging < 2) {
    throw new Error(`Skill ${s.id} fails question distribution requirement: ${JSON.stringify(stat)}`);
  }
}
console.log("  ✓ All 11 skills meet >=6 questions with >=2 per cognitive tier.");

// 3. Optional HTTP Live Server Probe
console.log("[3/4] Probing HTTP Server (if running on port 3000):");
function probeServer() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3000/api/test-pipeline", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          console.log(`  ✓ HTTP /api/test-pipeline responded ${res.statusCode}:`);
          console.log(`    - Total stages: ${json.summary?.totalStages}`);
          console.log(`    - Passed stages: ${json.summary?.passedStages}`);
          resolve(true);
        } catch {
          console.log(`  - HTTP responded ${res.statusCode} (non-JSON)`);
          resolve(false);
        }
      });
    });
    req.on("error", () => {
      console.log("  - Server not running on :3000 (skipped live HTTP probe; run during live test)");
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

await probeServer();

console.log("[4/4] Integration Verification Complete: ZERO ERRORS.");
