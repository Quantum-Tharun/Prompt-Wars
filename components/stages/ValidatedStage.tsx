"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { CalibrationRuler } from "@/components/viz/CalibrationRuler";
import { GapRadar } from "@/components/viz/GapRadar";
import { CountUpNumber } from "@/components/motion/CountUpNumber";
import { DecryptedText } from "@/components/motion/DecryptedText";
import { formatArchetype, formatProficiency } from "@/lib/format";
import careersCatalogue from "@/data/careers.json";

export function ValidatedStage() {
  const { state, dispatch } = useSkillPath();
  const [showFormula, setShowFormula] = useState(false);

  // Direct navigation empty state
  if (state.validatedSkills.length === 0) {
    return (
      <StageFrame
        stageNumber={4}
        title="Validated Skill Profile & Calibration"
        subtitle="Empirical cognitive calibration results and triangulated practitioner archetypes."
      >
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-8 text-center space-y-4">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            No diagnostic validation records available
          </div>
          <p className="text-[13px] text-[var(--pencil)] font-serif-reading max-w-md mx-auto">
            You must complete the diagnostic staircase or load a presenter demo snapshot to view verified calibration metrics.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => dispatch({ type: "SET_ACTIVE_STAGE", stage: 1 })}
              className="px-4 py-2 border border-[var(--rule)] text-[var(--ink)] hover:bg-[var(--surface-recessed)] rounded-[4px] text-[12px] cursor-pointer"
            >
              Go to Profile (Stage 1)
            </button>
            <button
              onClick={() => dispatch({ type: "LOAD_PRESET", presetNumber: 2 })}
              className="px-4 py-2 bg-[var(--ink)] text-[var(--surface)] hover:bg-[#323538] rounded-[4px] text-[12px] cursor-pointer"
            >
              Load Alex demo snapshot
            </button>
          </div>
        </div>
      </StageFrame>
    );
  }

  const overallReadiness = state.gapMatrix?.overallReadinessScore ?? 42;
  const targetCareer = careersCatalogue.find((c) => c.id === state.background.targetCareerId);

  // Sort by largest negative calibration gap first
  const sortedSkills = [...state.validatedSkills].sort(
    (a, b) => a.calibrationDelta - b.calibrationDelta
  );

  const handleTopicClick = (tag: string) => {
    dispatch({ type: "SET_SELECTED_TOPIC", topicTag: tag });
  };

  return (
    <StageFrame
      stageNumber={4}
      title="Validated Skill Profile & Calibration Gap"
      subtitle="Empirical cognitive calibration results, latency-checked confidence scores, and triangulated practitioner archetypes."
    >
      <div className="space-y-6">
        {/* Career Readiness Hero Header */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[12px] font-mono text-[var(--pencil)] uppercase tracking-wider">
              Career Readiness Score ({targetCareer?.title || "Full Stack Developer"})
            </div>
            <div className="text-[56px] font-bold text-[var(--ink)] tabular-nums leading-none mt-2 font-sans">
              <CountUpNumber value={overallReadiness} suffix="%" />
            </div>
            <p className="text-[13px] text-[var(--pencil)] font-serif-reading mt-2">
              Distance to target benchmark calculated using weighted proficiency ratios.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-[12px] px-3 py-1.5 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--surface-recessed)] rounded-[4px] cursor-pointer"
            >
              {showFormula ? "Hide formula breakdown" : "View formula breakdown"}
            </button>

            <div className="mt-4 text-[12px] text-[var(--pencil)] font-mono">
              3 Skills Validated · 1 Anomaly Flagged
            </div>
          </div>
        </div>

        {/* Expandable Formula Breakdown */}
        {showFormula && (
          <div className="border border-[var(--rule)] bg-[var(--surface-recessed)] p-4 text-[12px] space-y-2">
            <div className="font-semibold text-[var(--ink)]">Deterministic Readiness Formula:</div>
            <div className="font-mono bg-[var(--paper)] p-2 border border-[var(--rule)] text-[11px] overflow-x-auto text-[var(--ink)]">
              Readiness = sum(weight_i * min(validatedRank_i / targetRank_i, 1.0)) / sum(weight_i) * 100
            </div>
            <div className="text-[var(--pencil)] font-serif-reading">
              Python (Weight 4, Rank 2/2 = 1.0) + HTML (Weight 2, Rank 1/1 = 1.0) + SQL (Weight 4, Rank 1/2 = 0.5) = (4 + 2 + 2) / 19 = ~42% overall readiness across Full Stack benchmark requirements.
            </div>
          </div>
        )}

        {/* Sorted Calibration Rulers List */}
        <div className="space-y-4">
          <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Empirical Calibration Gauges (Sorted by Largest Deficit)
            </h2>
            <span className="text-[11px] text-[var(--pencil)] font-mono">
              GAP = VALIDATED - CLAIMED
            </span>
          </div>

          {sortedSkills.map((s) => {
            const req = targetCareer?.requirements.find((r) => r.skillId === s.skillId);
            const isNegative = s.calibrationDelta < 0;
            const isZero = s.calibrationDelta === 0;

            return (
              <div key={s.skillId} className="border border-[var(--rule)] bg-[var(--surface)]">
                {/* Horizontal Calibration Ruler Gauge */}
                <CalibrationRuler
                  skillId={s.skillId}
                  skillName={s.skillName}
                  claimedLevel={s.selfReportedLevel}
                  validatedLevel={s.validatedLevel}
                  requiredLevel={(req?.requiredLevel as any) || "intermediate"}
                  calibrationDelta={s.calibrationDelta}
                  assessmentScore={s.assessmentScore}
                />

                {/* Granular Diagnostics & Chips */}
                <div className="p-4 pt-2 border-t border-[var(--rule)] space-y-3 text-[12px]">
                  {/* Archetype & Confidence Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[var(--paper)] border border-[var(--ink)] font-semibold text-[var(--ink)] text-[11px]">
                      <DecryptedText text={formatArchetype(s.triangulatedArchetype)} />
                    </span>

                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium border ${
                        s.rapidGuessDetected
                          ? "bg-[var(--ochre-tint)] border-[var(--ochre)] text-[var(--ochre)]"
                          : "bg-[var(--surface-recessed)] border-[var(--rule)] text-[var(--pencil)]"
                      }`}
                    >
                      {s.rapidGuessDetected
                        ? "Medium confidence: rapid answers detected (<4s)"
                        : `${s.confidence.toUpperCase()} confidence: normal latency`}
                    </span>

                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium ${
                        isNegative
                          ? "bg-[var(--vermilion-tint)] text-[var(--vermilion)]"
                          : isZero
                          ? "bg-[var(--viridian-tint)] text-[var(--viridian)]"
                          : "bg-[var(--viridian-tint)] text-[var(--viridian)] font-bold"
                      }`}
                    >
                      {isNegative
                        ? "Illusion of competence"
                        : isZero
                        ? "Calibrated mastery"
                        : "Hidden strength"}
                    </span>
                  </div>

                  {/* Plain Language Evidence Summary */}
                  <p className="text-[12px] text-[var(--pencil)] font-serif-reading leading-relaxed">
                    {s.evidenceSummary}
                  </p>

                  {/* Micro-Topic Validation Chips */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-[var(--pencil)] font-mono">
                      Micro-Topic Diagnostics (Click to inspect):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.verifiedTopics.map((vTag) => (
                        <button
                          key={vTag}
                          type="button"
                          onClick={() => handleTopicClick(vTag)}
                          className="px-2 py-0.5 bg-[var(--viridian-tint)] text-[var(--viridian)] border border-[var(--viridian)] text-[11px] font-medium rounded-[2px] flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                          <span>{vTag}</span>
                        </button>
                      ))}

                      {s.weakTopics.map((w) => (
                        <button
                          key={w.topicTag}
                          type="button"
                          onClick={() => handleTopicClick(w.topicTag)}
                          className="px-2 py-0.5 bg-[var(--vermilion-tint)] text-[var(--vermilion)] border border-[var(--vermilion)] text-[11px] font-medium rounded-[2px] flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="2" y1="2" x2="10" y2="10" />
                            <line x1="10" y1="2" x2="2" y2="10" />
                          </svg>
                          <span>{w.topicTag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual-Layer Radar Chart */}
        <GapRadar
          validatedSkills={state.validatedSkills}
          targetCareerId={state.background.targetCareerId}
        />

        {/* Navigation Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_STAGE", stage: 5 })}
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
          >
            Inspect 5-phase learning roadmap (Stage 5)
          </button>
        </div>
      </div>
    </StageFrame>
  );
}
