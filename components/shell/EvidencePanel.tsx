"use client";

import React, { useEffect } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { formatCognitiveTier, formatProficiency, formatCareerTitle } from "@/lib/format";
import careersCatalogue from "@/data/careers.json";
import skillsCatalogue from "@/data/skills.json";
import resourcesCatalogue from "@/data/resources.json";

export function EvidencePanel() {
  const { state, dispatch } = useSkillPath();

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.evidencePanelOpen) {
        dispatch({ type: "SET_EVIDENCE_PANEL", open: false });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.evidencePanelOpen, dispatch]);

  const targetCareer = careersCatalogue.find(
    (c) => c.id === state.background.targetCareerId
  );

  const selectedModule = state.roadmap?.modules.find(
    (m) => m.moduleId === state.selectedModuleId
  );

  const selectedSkillForTopic = state.validatedSkills.find((s) =>
    s.weakTopics.some((w) => w.topicTag === state.selectedTopicTag)
  );

  const selectedWeakTopic = selectedSkillForTopic?.weakTopics.find(
    (w) => w.topicTag === state.selectedTopicTag
  );

  const renderContent = () => {
    switch (state.activeStage) {
      // Stage 0 & 1: Target Career Specification Table
      case 0:
      case 1:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Target Career Specification
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                {targetCareer?.description || "Benchmark requirements and skill weight matrix."}
              </p>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] text-[12px]">
              <div className="bg-[var(--surface-recessed)] px-2.5 py-1.5 font-medium border-b border-[var(--rule)] grid grid-cols-12 gap-1 text-[var(--ink)]">
                <span className="col-span-5">Skill</span>
                <span className="col-span-4">Required</span>
                <span className="col-span-3 text-right">Weight</span>
              </div>
              <div className="divide-y divide-[var(--rule)]">
                {targetCareer?.requirements.map((req) => {
                  const skillObj = skillsCatalogue.find((s) => s.id === req.skillId);
                  return (
                    <div
                      key={req.skillId}
                      className="px-2.5 py-1.5 grid grid-cols-12 gap-1 items-center"
                    >
                      <span className="col-span-5 font-medium text-[var(--ink)] truncate">
                        {skillObj?.name || req.skillId}
                      </span>
                      <span className="col-span-4 text-[var(--pencil)]">
                        {formatProficiency(req.requiredLevel)}
                      </span>
                      <span className="col-span-3 text-right tabular-nums text-[var(--ink)] font-semibold">
                        {req.weight}x
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 bg-[var(--surface)] border border-[var(--rule)] text-[12px] text-[var(--pencil)] font-serif-reading">
              Importance weights scale from 1 (supplementary) to 5 (critical core foundation). The career gap engine computes distance against these target ranks.
            </div>
          </div>
        );

      // Stage 2: Platform Consent Ledger
      case 2:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Platform Consent Ledger
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                Explicit permission state for each candidate data footprint.
              </p>
            </div>

            <div className="space-y-2">
              {state.consentEnvelopes.map((env) => (
                <div
                  key={env.platform}
                  className={`p-2.5 border rounded-[4px] text-[12px] ${
                    env.consentGranted
                      ? "bg-[var(--surface)] border-[var(--rule)]"
                      : "bg-[var(--vermilion-tint)] border-[var(--vermilion)]"
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="capitalize text-[var(--ink)]">{env.platform}</span>
                    <span
                      className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-[2px] ${
                        env.consentGranted
                          ? "bg-[var(--viridian-tint)] text-[var(--viridian)]"
                          : "bg-[var(--vermilion)] text-white"
                      }`}
                    >
                      {env.consentGranted ? "Granted" : "Refused / 403"}
                    </span>
                  </div>

                  <div className="mt-1.5 text-[11px] text-[var(--pencil)] space-y-0.5">
                    <div>
                      Account: <span className="font-mono text-[var(--ink)]">{env.accountIdentifier}</span>
                    </div>
                    <div>
                      Scopes: <span className="font-mono">{env.authorizedScopes.join(", ")}</span>
                    </div>
                    <div className="tabular-nums">
                      Timestamp: {new Date(env.consentedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-[var(--surface)] border border-[var(--rule)] text-[12px] text-[var(--pencil)] font-serif-reading">
              Zero-tolerance consent gate: When consent is false, the server halts platform queries and returns HTTP 403 PLATFORM_CONSENT_REQUIRED.
            </div>
          </div>
        );

      // Stage 3: Adaptive Staircase Rules & Cognitive Tier Weights
      case 3:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Adaptive Staircase Rules
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                3-Question staircase traversal mechanics and cognitive grading.
              </p>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] p-2.5 space-y-2 text-[12px]">
              <div className="font-medium text-[var(--ink)]">Traversal Protocol:</div>
              <ul className="list-disc pl-4 space-y-1 text-[var(--pencil)] font-serif-reading">
                <li><strong className="text-[var(--ink)]">Question 1 (Anchor):</strong> Calibrated to claimed or footprint-implied tier.</li>
                <li><strong className="text-[var(--ink)]">Question 2 (Floor / Ceiling):</strong> Moves up on correct answer; drops down on incorrect answer.</li>
                <li><strong className="text-[var(--ink)]">Question 3 (Career Boundary):</strong> Evaluates against career requirement threshold.</li>
              </ul>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] text-[12px]">
              <div className="bg-[var(--surface-recessed)] px-2.5 py-1.5 font-medium border-b border-[var(--rule)] text-[var(--ink)]">
                Cognitive Tier Scoring Multipliers
              </div>
              <div className="p-2.5 space-y-2 text-[var(--pencil)]">
                <div className="flex justify-between items-center">
                  <span>Declarative Concept (Syntax recall)</span>
                  <span className="font-semibold text-[var(--ink)] tabular-nums">1.0x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Code Tracing (Execution semantics)</span>
                  <span className="font-semibold text-[var(--ink)] tabular-nums">2.0x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Scenario Debugging (Architecture)</span>
                  <span className="font-semibold text-[var(--ink)] tabular-nums">3.0x</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-[var(--ochre-tint)] border border-[var(--ochre)] text-[12px] text-[var(--ochre)] font-serif-reading">
              Latency anomaly guardrail: Answering an intermediate or advanced question in under 4.0 seconds triggers a rapid-guess flag and caps confidence to medium.
            </div>
          </div>
        );

      // Stage 4: Micro-Topic Failure Inspector & Ruler Legend
      case 4:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Micro-Topic Failure Inspector
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                Click any failed topic chip on the left to inspect root causes.
              </p>
            </div>

            {selectedWeakTopic ? (
              <div className="border border-[var(--vermilion)] bg-[var(--vermilion-tint)] p-3 text-[12px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--vermilion)]">
                    Topic: {selectedWeakTopic.topicTag}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--pencil)]">
                    {selectedWeakTopic.questionId}
                  </span>
                </div>
                <div className="text-[var(--ink)]">
                  Cognitive Tier:{" "}
                  <strong>{formatCognitiveTier(selectedWeakTopic.failedCognitiveTier)}</strong>
                </div>
                <div className="text-[var(--pencil)] font-serif-reading">
                  Question evaluated relational query semantics and GROUP BY aggregations. Incorrect answer indicates reliance on course completion certificates without hands-on SQL query construction.
                </div>
              </div>
            ) : (
              <div className="border border-[var(--rule)] bg-[var(--surface)] p-3 text-[12px] text-[var(--pencil)] font-serif-reading">
                No individual micro-topic selected. Click on a red topic chip in the Validated Profile list to inspect question-level diagnosis.
              </div>
            )}

            <div className="border border-[var(--rule)] bg-[var(--surface)] p-2.5 text-[12px] space-y-2">
              <div className="font-medium text-[var(--ink)]">Calibration Ruler Legend:</div>
              <div className="space-y-1.5 text-[11px] text-[var(--pencil)]">
                <div className="flex items-center gap-2">
                  <div className="w-[12px] h-[12px] rounded-[50%] border border-dashed border-[var(--pencil)] bg-[var(--surface)]" />
                  <span>Dashed hollow circle: Self-reported claimed rank</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[12px] h-[12px] rounded-[50%] bg-[var(--viridian)]" />
                  <span>Solid viridian marker: Empirically verified rank</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[2px] h-[14px] bg-[var(--ink)] mx-1" />
                  <span>Vertical carbon hairline: Career target requirement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[14px] h-[8px] bg-[var(--vermilion)] opacity-60" />
                  <span>Vermilion hatch: Overconfident deficit (Illusion of competence)</span>
                </div>
              </div>
            </div>
          </div>
        );

      // Stage 5: Selected Module Inspector & Provenance
      case 5:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Roadmap Module Inspector
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                {selectedModule
                  ? `Phase ${selectedModule.phaseNumber}: ${selectedModule.phaseTitle}`
                  : "Click any station in the DAG rail to view provenance."}
              </p>
            </div>

            {selectedModule ? (
              <div className="border border-[var(--rule)] bg-[var(--surface)] p-3 text-[12px] space-y-3">
                <div className="border-b border-[var(--rule)] pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--ink)]">{selectedModule.title}</span>
                    <span className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 font-medium border border-[var(--rule)]">
                      {selectedModule.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--pencil)] mt-0.5">
                    Skill: <strong className="text-[var(--ink)]">{selectedModule.skillId}</strong> · Est: {selectedModule.estimatedHours} hrs · ROI: +{selectedModule.readinessImpactPercent}%
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-[var(--ink)] mb-1">Learning Objectives:</div>
                  <ul className="list-disc pl-4 space-y-1 text-[var(--pencil)] font-serif-reading">
                    {selectedModule.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-semibold text-[var(--ink)] mb-1">Practical Exercise:</div>
                  <div className="p-2 bg-[var(--surface-recessed)] text-[var(--ink)] font-serif-reading">
                    {selectedModule.practicalExercisePrompt}
                  </div>
                </div>

                {selectedModule.curatedResourceIds.length > 0 && (
                  <div>
                    <div className="font-semibold text-[var(--ink)] mb-1">Curated Resources:</div>
                    <div className="space-y-1">
                      {selectedModule.curatedResourceIds.map((resId) => {
                        const resObj = resourcesCatalogue.find((r) => r.id === resId);
                        return (
                          <div key={resId} className="flex items-center justify-between p-1.5 border border-[var(--rule)] bg-[var(--surface)]">
                            <span className="truncate pr-2 font-medium">{resObj?.title || resId}</span>
                            <span className="text-[10px] text-[var(--pencil)] shrink-0 font-mono">
                              {resObj?.provider || "Docs"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedModule.provenance && (
                  <div className="p-2.5 bg-[var(--viridian-tint)] border border-[var(--viridian)] text-[var(--ink)]">
                    <div className="font-semibold text-[var(--viridian)] mb-1">
                      Why is this on my roadmap? (Provenance)
                    </div>
                    <p className="font-serif-reading text-[12px] leading-relaxed">
                      {selectedModule.provenance.auditTrailText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-[var(--rule)] bg-[var(--surface)] p-3 text-[12px] text-[var(--pencil)] font-serif-reading">
                Click any module node along the DAG track to view its prerequisite links and empirical provenance.
              </div>
            )}
          </div>
        );

      // Stage 6: Before/After Readiness Diff & Agent 4 Coaching
      case 6:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Remediation & Gate Telemetry
              </h3>
              <p className="text-[12px] text-[var(--pencil)] mt-0.5 font-serif-reading">
                Agent 4 Adaptive Mentor failure diagnosis and gate-unlock diff.
              </p>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] p-3 text-[12px] space-y-2">
              <div className="font-semibold text-[var(--ink)]">Career Readiness Delta:</div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--rule)]">
                <span className="text-[var(--pencil)]">Baseline readiness:</span>
                <span className="font-bold tabular-nums">
                  {state.preRecoveryReadiness ?? state.gapMatrix?.overallReadinessScore ?? 42}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--rule)]">
                <span className="text-[var(--pencil)]">Post-remediation recovery:</span>
                <span className="font-bold text-[var(--viridian)] tabular-nums">
                  {state.postRecoveryReadiness ?? 61}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--pencil)]">Readiness jump:</span>
                <span className="font-bold text-[var(--viridian)] tabular-nums">
                  +{(state.postRecoveryReadiness && state.preRecoveryReadiness)
                    ? state.postRecoveryReadiness - state.preRecoveryReadiness
                    : 19}%
                </span>
              </div>
            </div>

            <div className="border border-[var(--vermilion)] bg-[var(--vermilion-tint)] p-3 text-[12px] space-y-2">
              <div className="font-bold text-[var(--vermilion)]">
                Prerequisite Gate Enforcement:
              </div>
              <p className="text-[var(--ink)] font-serif-reading leading-relaxed">
                When Alex scored 35% on the JavaScript checkpoint, the Adaptation Engine locked downstream React and inserted a surgical Async remediation node. Upon scoring 100% on the recovery quiz, the lock was dynamically dissolved.
              </p>
            </div>
          </div>
        );

      // Stage 7: Dynamic Readiness Telemetry
      case 7:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Dynamic Readiness Telemetry
              </h3>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Deterministic calculation of weighted curriculum completion.
              </p>
            </div>

            <div className="border border-[var(--viridian)] bg-[var(--viridian-tint)] p-3 text-[12px] space-y-2">
              <div className="font-bold text-[var(--viridian)]">Module Completion Progress:</div>
              <div className="text-[24px] font-bold text-[var(--ink)] tabular-nums font-mono">
                {state.completedModuleIds.length} / {state.roadmap?.modules.length || 0} modules
              </div>
              <p className="text-[var(--pencil)] font-serif-reading">
                Toggling modules recalculates career readiness via the career requirement weight matrix without manual overrides.
              </p>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] text-[12px]">
              <div className="bg-[var(--surface-recessed)] px-2.5 py-1.5 font-medium border-b border-[var(--rule)] text-[var(--ink)]">
                Telemetry Formula
              </div>
              <div className="p-2.5 space-y-1 text-[var(--pencil)] font-mono text-[11px]">
                <div>Readiness = Sum(weight_i * match_i) / Sum(weight_i)</div>
                <div>Completed: [{state.completedModuleIds.join(", ") || "None"}]</div>
              </div>
            </div>
          </div>
        );

      // Stage 8: Transferred Skill Capital Breakdown
      case 8:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Skill Capital Ledger
              </h3>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Zero-loss career switch preservation accounting.
              </p>
            </div>

            <div className="border border-[var(--viridian)] bg-[var(--viridian-tint)] p-3 text-[12px] space-y-2">
              <div className="font-bold text-[var(--viridian)]">Transferred Skill Hours Saved:</div>
              <div className="text-[28px] font-bold text-[var(--ink)] tabular-nums">
                {state.careerPivotResult?.skillCapitalLedger.hoursSaved || 15} hrs
              </div>
              <p className="text-[var(--pencil)] font-serif-reading">
                Python (86% Intermediate) carries over at 100% credit towards the Data Analyst role, eliminating 15 to 20 redundant curriculum hours.
              </p>
            </div>

            <div className="border border-[var(--rule)] bg-[var(--surface)] text-[12px]">
              <div className="bg-[var(--surface-recessed)] px-2.5 py-1.5 font-medium border-b border-[var(--rule)] text-[var(--ink)]">
                Capital Ledger Breakdown
              </div>
              <div className="p-2.5 space-y-1.5 text-[var(--pencil)] font-serif-reading">
                <div>• Retained skills: Python (100% transfer)</div>
                <div>• Contextual bridge: SQL (advanced analytics focus)</div>
                <div>• Net-new domain gaps: Pandas, Statistics</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Desktop fixed 340px inspector */}
      <aside className="hidden lg:block w-[340px] shrink-0 border-l border-[var(--rule)] bg-[var(--paper)] p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--rule)]">
          <span className="text-[12px] font-semibold text-[var(--pencil)] uppercase tracking-wider">
            Evidence Log
          </span>
          <span className="text-[11px] text-[var(--pencil)] font-mono">
            STAGE {state.activeStage} TELEMETRY
          </span>
        </div>
        {renderContent()}
      </aside>

      {/* Mobile / Tablet slide-over drawer toggle button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => dispatch({ type: "TOGGLE_EVIDENCE_PANEL" })}
          className="bg-[var(--ink)] text-[var(--surface)] px-3 py-2 rounded-[4px] text-[13px] font-medium border border-[var(--rule)] cursor-pointer"
        >
          {state.evidencePanelOpen ? "Close evidence" : "Evidence log"}
        </button>
      </div>

      {/* Slide-over Drawer for <1180px */}
      {state.evidencePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/40">
          <div
            className="w-full max-w-sm h-full bg-[var(--paper)] text-[var(--ink)] p-4 overflow-y-auto border-l border-[var(--ink)]"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--rule)]">
              <span className="text-[12px] font-semibold text-[var(--pencil)] uppercase tracking-wider">
                Evidence Log
              </span>
              <button
                onClick={() => dispatch({ type: "SET_EVIDENCE_PANEL", open: false })}
                className="text-[var(--ink)] px-2 py-1 border border-[var(--rule)] text-[12px] rounded-[4px] cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
