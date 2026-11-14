# Judging Criteria & Coverage Mapping (Attempt 2)

| Criteria | Baseline Status | Attempt 2 Target | Responsible Files | Gaps to Close |
| :--- | :--- | :--- | :--- | :--- |
| **Skill Discovery** | Partial | Covered | `app/api/discovery/init`, `lib/footprint/platform-connector.ts`, `components/stages/ProfileStage.tsx` | Extend profile to collect rich projects, certifications, interests; surface in provenance. |
| **Knowledge Verification** | Partial | Covered | `lib/assessment/scoring-engine.ts`, `data/questions.json`, `components/stages/VerifyStage.tsx` | Ensure >=6 questions/skill (2+ per tier), cap rapid answer confidence, honest "N of M topics assessed" display. |
| **Career Matching** | Covered | Covered | `data/careers.json`, `lib/engine/career-matcher.ts`, `components/stages/ValidatedStage.tsx` | Full Stack, Data Analyst, AI/ML matrices; clarify unassessed prototype skills. |
| **Dynamic Roadmap** | Covered | Covered | `lib/agents/learning-planner.ts`, `components/viz/PrerequisiteRail.tsx`, `components/stages/RoadmapStage.tsx` | DAG topological sort, zero circular deps, only unverified/gap skills assigned to modules. |
| **Progress Tracking** | **Missing** | **Covered** | `components/stages/ProgressStage.tsx`, `lib/store/skillpath-store.tsx` | Add 8th stage: module completion toggles updating readiness, assessment history table, milestones, Recharts progress line chart. |
| **Adaptive Mentor** | Covered | Covered | `lib/agents/adaptive-mentor.ts`, `lib/engine/adaptation-engine.ts`, `components/stages/MentorStage.tsx` | Spliced remediation module on failure, gate unlock on recovery, Agent 4 narrative. |
| **Orchestrator Agents** | Covered | Covered | `lib/agents/orchestrator.ts`, `lib/agents/*.ts`, `lib/ai/gemini.ts` | 4 parallel Gemini agents with 5s circuit-breaker deterministic fallback. |
| **Explainability** | Partial | Covered | `components/stages/ValidatedStage.tsx`, `components/viz/CalibrationRuler.tsx` | Plain-sentence "Why" justification for every card/gap; "How this was calculated" panel. |
| **Reliability / UX** | Covered | Covered | `app/layout.tsx`, `app/globals.css`, `components/shell/*` | Anti-slop constraints: zero gradients, zero emojis, zero drop-shadows, responsive 390px/768px/1440px. |
