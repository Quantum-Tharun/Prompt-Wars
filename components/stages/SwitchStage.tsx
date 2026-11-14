"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { apiClient } from "@/lib/api/client";
import { PrerequisiteRail } from "@/components/viz/PrerequisiteRail";
import { CountUpNumber } from "@/components/motion/CountUpNumber";
import careersCatalogue from "@/data/careers.json";
import { formatProficiency } from "@/lib/format";
import { type CareerId } from "@/lib/schemas/domain.schema";

export function SwitchStage() {
  const { state, dispatch } = useSkillPath();
  const [selectedTarget, setSelectedTarget] = useState<CareerId>("data_analyst");

  if (state.validatedSkills.length === 0) {
    return (
      <StageFrame
        stageNumber={8}
        title="Zero-Loss Career Switch & Skill Capital Ledger"
        subtitle="Cross-career skill transfer engine preserving earned curriculum capital."
      >
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-8 text-center space-y-4">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            No validated skills to transfer
          </div>
          <p className="text-[13px] text-[var(--pencil)] font-serif-reading max-w-md mx-auto">
            You must have validated skills from diagnostic assessment to compute the Skill Capital Preservation Ledger.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
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

  const handleComputePivot = async () => {
    dispatch({
      type: "START_LOADING",
      message: `Computing zero-loss career pivot to ${selectedTarget}...`,
    });

    try {
      const res = await apiClient.pivotCareer(
        state.background,
        state.validatedSkills,
        state.background.targetCareerId,
        selectedTarget
      );

      dispatch({ type: "SET_CAREER_PIVOT_DATA", payload: res });
      dispatch({ type: "STOP_LOADING" });
    } catch (err: unknown) {
      dispatch({ type: "STOP_LOADING" });
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Career pivot calculation error: ${msg}`);
    }
  };

  const pivotResult = state.careerPivotResult;
  const targetCareer = careersCatalogue.find((c) => c.id === selectedTarget);

  return (
    <StageFrame
      stageNumber={8}
      title="Zero-Loss Career Switch & Skill Capital Ledger"
      subtitle="Eliminate starting from scratch. Quantify transferred curriculum capital, contextual bridge deltas, and net-new domain requirements."
    >
      <div className="space-y-6">
        {/* Career Selector Bar */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Choose New Career Target
            </h2>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
              Current benchmark: <strong>{state.background.targetCareerId}</strong>. Switch to a new trajectory to calculate capital transfer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {careersCatalogue.map((c) => {
              const isSelected = selectedTarget === c.id;
              const isCurrent = state.background.targetCareerId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedTarget(c.id as CareerId)}
                  className={`p-3.5 border rounded-[4px] cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[2px] border-[var(--ink)] bg-[var(--paper)]"
                      : "border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--paper)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-[var(--ink)]">{c.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--surface-recessed)] text-[var(--pencil)]">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--pencil)] font-serif-reading mt-1 line-clamp-2">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleComputePivot}
              className="px-4 py-2 bg-[var(--ink)] text-[var(--surface)] hover:bg-[#323538] rounded-[4px] text-[13px] font-medium cursor-pointer"
            >
              Compute zero-loss pivot ledger
            </button>
          </div>
        </div>

        {/* Skill Capital Ledger Display */}
        {pivotResult && (
          <div className="space-y-4">
            {/* 4-Metric Summary Bar */}
            <div className="border border-[var(--viridian)] bg-[var(--viridian-tint)] p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="border-r border-[var(--viridian)]/40 pr-2">
                <div className="text-[11px] font-mono uppercase text-[var(--pencil)]">
                  Hours Saved
                </div>
                <div className="text-[28px] font-bold text-[var(--viridian)] tabular-nums mt-0.5">
                  <CountUpNumber value={pivotResult.skillCapitalLedger.hoursSaved} suffix="h" />
                </div>
              </div>
              <div className="border-r border-[var(--viridian)]/40 pr-2">
                <div className="text-[11px] font-mono uppercase text-[var(--pencil)]">
                  Transferred Skills
                </div>
                <div className="text-[28px] font-bold text-[var(--ink)] tabular-nums mt-0.5">
                  {pivotResult.skillCapitalLedger.retainedValidatedSkills.length}
                </div>
              </div>
              <div className="border-r border-[var(--viridian)]/40 pr-2">
                <div className="text-[11px] font-mono uppercase text-[var(--pencil)]">
                  Contextual Bridges
                </div>
                <div className="text-[28px] font-bold text-[var(--ochre)] tabular-nums mt-0.5">
                  {pivotResult.skillCapitalLedger.contextualBridgeCount}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[var(--pencil)]">
                  Net-New Domain Gaps
                </div>
                <div className="text-[28px] font-bold text-[var(--vermilion)] tabular-nums mt-0.5">
                  {pivotResult.skillCapitalLedger.unassessedSkillCount}
                </div>
              </div>
            </div>

            {/* Detailed Ledger Breakdown Table */}
            <div className="border border-[var(--rule)] bg-[var(--surface)]">
              <div className="p-4 border-b border-[var(--rule)]">
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                  Skill Capital Preservation Breakdown
                </h3>
                <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                  Auditing skill carryover from Full Stack Developer to Data Analyst.
                </p>
              </div>

              <div className="overflow-x-auto text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-recessed)] border-b border-[var(--rule)] text-[var(--ink)]">
                      <th className="p-3 font-medium">Skill</th>
                      <th className="p-3 font-medium">Transfer Classification</th>
                      <th className="p-3 font-medium">Validated Level</th>
                      <th className="p-3 font-medium">Hours Preserved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)] text-[var(--pencil)]">
                    {pivotResult.pivotResult.transferredSkills.map((s) => (
                      <tr key={s.skillId} className="bg-[var(--viridian-tint)]/20">
                        <td className="p-3 font-medium text-[var(--ink)]">{s.skillName}</td>
                        <td className="p-3 font-semibold text-[var(--viridian)]">
                          100% Direct Transfer (Existing Capital)
                        </td>
                        <td className="p-3">{formatProficiency(s.validatedLevel)}</td>
                        <td className="p-3 font-bold text-[var(--ink)] tabular-nums font-mono">
                          {s.validatedLevel === "advanced" ? "25 hours" : "15 hours"}
                        </td>
                      </tr>
                    ))}

                    {pivotResult.pivotResult.newSkillsToLearn.map((n) => (
                      <tr key={n.skillId}>
                        <td className="p-3 font-medium text-[var(--ink)]">{n.skillId}</td>
                        <td className="p-3 text-[var(--vermilion)]">
                          Net-New Requirement (Must Assess)
                        </td>
                        <td className="p-3">Required: {formatProficiency(n.requiredLevel)}</td>
                        <td className="p-3 text-[var(--pencil)] tabular-nums font-mono">0 hours</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Newly Synthesized Roadmap */}
            <div>
              <div className="border-b border-[var(--rule)] pb-2 mb-3">
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                  Pivoted Learning Roadmap ({targetCareer?.title})
                </h3>
                <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                  Surgically tailored to bridge only new domain topics without re-teaching mastered Python capabilities.
                </p>
              </div>

              <PrerequisiteRail roadmap={pivotResult.updatedRoadmap} />
            </div>
          </div>
        )}
      </div>
    </StageFrame>
  );
}

