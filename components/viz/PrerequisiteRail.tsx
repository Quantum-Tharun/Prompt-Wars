"use client";

import React, { useState } from "react";
import { type LearningRoadmap, type RoadmapModule } from "@/lib/schemas/domain.schema";
import { useSkillPath } from "@/lib/store/skillpath-store";

interface PrerequisiteRailProps {
  roadmap: LearningRoadmap;
}

const PHASES = [
  { num: 1, title: "Foundations & Critical Gaps" },
  { num: 2, title: "Language Core & Runtime" },
  { num: 3, title: "Client Framework Architecture" },
  { num: 4, title: "Full Stack Integration" },
  { num: 5, title: "Production Capstone" },
];

export function PrerequisiteRail({ roadmap }: PrerequisiteRailProps) {
  const { state, dispatch } = useSkillPath();
  const [viewMode, setViewMode] = useState<"diagram" | "list">("diagram");

  const modulesByPhase: Record<number, RoadmapModule[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  roadmap.modules.forEach((mod) => {
    const phase = mod.phaseNumber in modulesByPhase ? mod.phaseNumber : 1;
    modulesByPhase[phase].push(mod);
  });

  const handleSelectModule = (moduleId: string) => {
    dispatch({ type: "SET_SELECTED_MODULE", moduleId });
  };

  return (
    <div className="border border-[var(--rule)] bg-[var(--surface)] my-4">
      {/* Top Bar with Mode Toggle */}
      <div className="p-3 border-b border-[var(--rule)] flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            5-Phase Dependency Station & Gate DAG
          </h3>
          <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
            Strict prerequisite gates enforce step-by-step competency verification.
          </p>
        </div>

        <div className="flex items-center gap-1 border border-[var(--rule)] p-0.5 rounded-[4px] bg-[var(--paper)] text-[12px]">
          <button
            onClick={() => setViewMode("diagram")}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              viewMode === "diagram"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold"
                : "text-[var(--pencil)] hover:text-[var(--ink)]"
            }`}
          >
            Station diagram
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
              viewMode === "list"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold"
                : "text-[var(--pencil)] hover:text-[var(--ink)]"
            }`}
          >
            Accessible list
          </button>
        </div>
      </div>

      {viewMode === "diagram" ? (
        <div className="overflow-x-auto p-4">
          <div className="min-w-[840px] grid grid-cols-5 divide-x divide-dashed divide-[var(--rule)]">
            {PHASES.map((p) => {
              const phaseMods = modulesByPhase[p.num] || [];

              return (
                <div key={p.num} className="px-3 space-y-3">
                  {/* Column Header */}
                  <div className="border-b border-[var(--rule)] pb-2">
                    <div className="text-[11px] font-mono font-bold text-[var(--pencil)] uppercase">
                      Phase {p.num}
                    </div>
                    <div className="text-[12px] font-semibold text-[var(--ink)] truncate mt-0.5" title={p.title}>
                      {p.title}
                    </div>
                  </div>

                  {/* Module Stations */}
                  <div className="space-y-3">
                    {phaseMods.length === 0 ? (
                      <div className="p-3 border border-dashed border-[var(--rule)] text-[11px] text-[var(--pencil)] text-center">
                        No modules scheduled
                      </div>
                    ) : (
                      phaseMods.map((mod) => {
                        const isSelected = state.selectedModuleId === mod.moduleId;
                        const isLocked = mod.status === "locked";
                        const isInserted = mod.isAdaptiveInsertion;

                        return (
                          <div
                            key={mod.moduleId}
                            onClick={() => handleSelectModule(mod.moduleId)}
                            className={`p-3 rounded-[0px] cursor-pointer border transition-colors relative ${
                              isInserted
                                ? "bg-[var(--vermilion-tint)] border-[2px] border-[var(--vermilion)] text-[var(--ink)]"
                                : isLocked
                                ? "bg-[var(--surface-recessed)] border-dashed border-[var(--pencil)] text-[var(--pencil)]"
                                : isSelected
                                ? "bg-[var(--paper)] border-[2px] border-[var(--ink)] text-[var(--ink)]"
                                : "bg-[var(--surface)] border-[1px] border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--paper)]"
                            }`}
                          >
                            {/* Gate Padlock Glyph */}
                            {isLocked && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--vermilion)] mb-1">
                                <svg
                                  className="w-3.5 h-3.5 shrink-0"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span>Locked</span>
                              </div>
                            )}

                            {isInserted && (
                              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--vermilion)] mb-1">
                                Spliced Remediation
                              </div>
                            )}

                            <div className="text-[13px] font-semibold leading-tight line-clamp-2">
                              {mod.title}
                            </div>

                            <p className="mt-1 text-[11px] text-[var(--pencil)] font-serif-reading line-clamp-2">
                              Why: Bridges {mod.skillId} ({mod.targetTopics.join(", ")}) to unlock downstream gates (+{mod.readinessImpactPercent}% readiness).
                            </p>

                            <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                              <span className="uppercase text-[var(--pencil)]">{mod.skillId}</span>
                              <span className="tabular-nums font-medium text-[var(--ink)]">
                                {mod.estimatedHours}h · +{mod.readinessImpactPercent}%
                              </span>
                            </div>

                            {/* Prerequisite blocker text */}
                            {isLocked && mod.prerequisiteModuleIds.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-dashed border-[var(--rule)] text-[10px] text-[var(--pencil)] font-serif-reading">
                                Prereq: {mod.prerequisiteModuleIds[0]}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div className="p-4 divide-y divide-[var(--rule)] text-[13px]">
          {roadmap.modules.map((mod) => {
            const isSelected = state.selectedModuleId === mod.moduleId;
            return (
              <div
                key={mod.moduleId}
                onClick={() => handleSelectModule(mod.moduleId)}
                className={`py-3 px-2 flex flex-col md:flex-row md:items-center justify-between gap-2 cursor-pointer ${
                  isSelected ? "bg-[var(--surface-recessed)]" : "hover:bg-[var(--paper)]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--pencil)]">
                      Phase {mod.phaseNumber}
                    </span>
                    <span className="font-semibold text-[var(--ink)]">{mod.title}</span>
                    {mod.isAdaptiveInsertion && (
                      <span className="text-[10px] bg-[var(--vermilion)] text-white px-1.5 py-0.5 rounded-[2px] font-semibold">
                        Spliced Remediation
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--pencil)] font-serif-reading mt-0.5">
                    Skill: {mod.skillId} · Status: {mod.status}
                    {mod.prerequisiteModuleIds.length > 0 && ` · Blocked by: ${mod.prerequisiteModuleIds.join(", ")}`}
                  </div>
                  <div className="text-[11px] text-[var(--pencil)] font-serif-reading">
                    Why: Bridges verified deficit in {mod.skillId} ({mod.targetTopics.join(", ")}).
                  </div>
                </div>

                <div className="text-right tabular-nums text-[12px] text-[var(--ink)] shrink-0">
                  <span className="font-medium">{mod.estimatedHours} hours</span>
                  <span className="text-[var(--pencil)] ml-2">(+{mod.readinessImpactPercent}% ROI)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
