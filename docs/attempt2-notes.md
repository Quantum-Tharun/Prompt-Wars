# Attempt 2 Notes & Baseline Results

## Step 0: Protection & Baseline State
- **Rollback Git Tag**: `attempt-1-93.19` (pushed to origin)
- **Rollback Git Branch**: `backup/attempt-1` (pushed to origin)
- **Baseline Build**: `npm run build` compiled successfully in 8.3s, 13 static pages, 11 dynamic API routes.
- **Type Check**: `npx tsc --noEmit` exits with code 0.
- **Baseline Score**: 93.19 (Rank 14). Target: >95.00.

## Baseline Route & Preset Coverage
- 4 Presets working: Preset 1 (Init Profile), Preset 2 (Validated Profile), Preset 3 (Roadmap), Preset 4 (Career Switch).
- All 10 API routes responsive.
- Baseline completeness:
  - 7 learner stages active (Stage 0: Landing Overview, Stage 1: Profile, Stage 2: Connect, Stage 3: Verify, Stage 4: Validated, Stage 5: Roadmap, Stage 6: Mentor, Stage 7: Switch).
  - Missing dedicated Progress Tracking stage (required as 8th stage).
  - Profile collects basic skills but lacks rich projects/certifications/interests.
  - Question bank needs expansion to ensure >=6 questions per skill (2+ per tier).
