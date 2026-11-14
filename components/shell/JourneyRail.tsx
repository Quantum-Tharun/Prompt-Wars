"use client";

import React from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";

interface StageItem {
  id: number;
  label: string;
  tagline: string;
}

const STAGES: StageItem[] = [
  { id: 0, label: "Overview", tagline: "Instrument entry & ASCII field" },
  { id: 1, label: "Profile", tagline: "Goals & claimed skills" },
  { id: 2, label: "Connect", tagline: "Consent & platform footprint" },
  { id: 3, label: "Verify", tagline: "Adaptive staircase diagnostic" },
  { id: 4, label: "Validated profile", tagline: "Calibration gap & archetypes" },
  { id: 5, label: "Roadmap", tagline: "5-phase prerequisite DAG" },
  { id: 6, label: "Mentor", tagline: "Checkpoint failure & gate unlock" },
  { id: 7, label: "Career switch", tagline: "Skill capital ledger" },
];

export function JourneyRail() {
  const { state, dispatch } = useSkillPath();

  const handleStageClick = (stageId: number) => {
    dispatch({ type: "SET_ACTIVE_STAGE", stage: stageId });
  };

  return (
    <aside className="w-full md:w-[220px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] select-none">
      <div className="p-3 border-b border-[var(--rule)]">
        <h2 className="text-[12px] font-semibold text-[var(--pencil)] uppercase tracking-wider">
          Journey Rail
        </h2>
        <p className="text-[11px] text-[var(--pencil)] mt-0.5">
          Calibration sequence
        </p>
      </div>

      <nav className="p-2 flex md:flex-col overflow-x-auto gap-1">
        {STAGES.map((s) => {
          const isCurrent = state.activeStage === s.id;
          const isCompleted = state.activeStage > s.id;
          const isFuture = state.activeStage < s.id;

          return (
            <button
              key={s.id}
              onClick={() => handleStageClick(s.id)}
              className={`w-full text-left px-2.5 py-2 rounded-[4px] border transition-colors flex items-center gap-2.5 text-[13px] cursor-pointer shrink-0 ${
                isCurrent
                  ? "bg-[var(--paper)] border-[var(--ink)] font-semibold text-[var(--ink)]"
                  : "bg-transparent border-transparent hover:bg-[var(--surface-recessed)] text-[var(--pencil)]"
              }`}
            >
              {/* State Marker Glyph */}
              <div className="w-[14px] flex items-center justify-center shrink-0">
                {isCompleted && (
                  <div
                    className="w-[8px] h-[8px] rounded-full bg-[var(--ink)]"
                    title="Completed stage"
                  />
                )}
                {isCurrent && (
                  <div
                    className="w-[10px] h-[10px] rounded-full border-2 border-[var(--viridian)] bg-transparent"
                    title="Current active stage"
                  />
                )}
                {isFuture && (
                  <div
                    className="w-[8px] h-[8px] rounded-full border border-dashed border-[var(--pencil)] bg-transparent"
                    title="Unvisited stage"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-snug">
                  <span className="tabular-nums text-[11px] text-[var(--pencil)] font-mono">
                    {s.id === 0 ? "0." : `${s.id}.`}
                  </span>
                  <span className={`truncate ${isCurrent ? "text-[var(--ink)]" : ""}`}>
                    {s.label}
                  </span>
                </div>
                <div className="hidden md:block text-[11px] text-[var(--pencil)] truncate mt-0.5">
                  {s.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
