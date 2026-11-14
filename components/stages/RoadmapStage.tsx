"use client";

import React from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { PrerequisiteRail } from "@/components/viz/PrerequisiteRail";
import { AgentTrace } from "@/components/viz/AgentTrace";

export function RoadmapStage() {
  const { state, dispatch } = useSkillPath();

  if (!state.roadmap) {
    return (
      <StageFrame
        stageNumber={5}
        title="5-Phase Dependency-Locked Learning Roadmap"
        subtitle="Topologically sorted Directed Acyclic Graph enforcing strict competency gates."
      >
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-8 text-center space-y-4">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            No active learning roadmap generated
          </div>
          <p className="text-[13px] text-[var(--pencil)] font-serif-reading max-w-md mx-auto">
            You must validate your diagnostic assessment to synthesize the 5-phase DAG roadmap, or load Alex Chen's calibrated preset.
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

  return (
    <StageFrame
      stageNumber={5}
      title="5-Phase Dependency-Locked Learning Roadmap"
      subtitle="Topologically sorted Directed Acyclic Graph with explicit prerequisite gates, explainable provenance, and ROI readouts."
    >
      <div className="space-y-6">
        {/* Roadmap Metric Summary */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="border-r border-[var(--rule)] pr-2">
            <div className="text-[11px] font-mono text-[var(--pencil)] uppercase">Total Hours</div>
            <div className="text-[24px] font-bold text-[var(--ink)] tabular-nums mt-0.5">
              {state.roadmap.totalEstimatedHours}h
            </div>
          </div>
          <div className="border-r border-[var(--rule)] pr-2">
            <div className="text-[11px] font-mono text-[var(--pencil)] uppercase">Projected Velocity</div>
            <div className="text-[24px] font-bold text-[var(--ink)] tabular-nums mt-0.5">
              {state.roadmap.projectedCompletionWeeks} wks
            </div>
          </div>
          <div className="border-r border-[var(--rule)] pr-2">
            <div className="text-[11px] font-mono text-[var(--pencil)] uppercase">Modules Scheduled</div>
            <div className="text-[24px] font-bold text-[var(--ink)] tabular-nums mt-0.5">
              {state.roadmap.modules.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--pencil)] uppercase">Revision</div>
            <div className="text-[24px] font-bold text-[var(--viridian)] tabular-nums mt-0.5">
              v{state.roadmap.revisionNumber}
            </div>
          </div>
        </div>

        {/* 5-Phase Station Diagram */}
        <PrerequisiteRail roadmap={state.roadmap} />

        {/* Multi-Agent Orchestration Telemetry */}
        <AgentTrace traces={state.agentTraces} />

        {/* Next Stage Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_STAGE", stage: 6 })}
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
          >
            Test adaptive mentor simulation (Stage 6)
          </button>
        </div>
      </div>
    </StageFrame>
  );
}

