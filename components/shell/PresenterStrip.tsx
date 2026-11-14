"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { apiClient } from "@/lib/api/client";
import { type TestPipelineResponse } from "@/lib/api/adapters";
import {
  SAMPLE_FULLSTACK_GAP_MATRIX,
  SAMPLE_FULLSTACK_ROADMAP,
} from "@/lib/client-presets";
import { PRESET_1_ONBOARDING, PRESET_2_CALIBRATED } from "@/lib/demo-presets";

export function PresenterStrip() {
  const { state, dispatch } = useSkillPath();
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestPipelineResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    if (typeof document !== "undefined") {
      if (next) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
      } else {
        document.documentElement.removeAttribute("data-reduced-motion");
      }
    }
  };

  const handleRunSelfTest = async () => {
    setIsRunningTest(true);
    setTestError(null);
    setTestModalOpen(true);
    try {
      const res = await apiClient.runSelfTest();
      setTestResults(res);
    } catch (err: any) {
      setTestError(err.message || "Failed to execute server assertion suite.");
    } finally {
      setIsRunningTest(false);
    }
  };

  const loadPreset1 = () => {
    dispatch({ type: "LOAD_PRESET", presetNumber: 1 });
  };

  const loadPreset2 = () => {
    dispatch({ type: "LOAD_PRESET", presetNumber: 2 });
    dispatch({
      type: "SET_ORCHESTRATION_DATA",
      payload: {
        success: true,
        validatedSkills: PRESET_2_CALIBRATED.validatedSkills,
        gapMatrix: SAMPLE_FULLSTACK_GAP_MATRIX,
        roadmap: SAMPLE_FULLSTACK_ROADMAP,
        agentTrace: [
          {
            agentName: "SkillAnalyzer",
            executedAt: new Date().toISOString(),
            durationMs: 420,
            usedFallback: true,
            inputSummary: "Assessed 3 skills (Python, SQL, HTML).",
            keyFindings: [
              "Python verified at intermediate level (86% score).",
              "SQL overconfident deficit detected: claimed intermediate, scored 50% beginner.",
            ],
          },
          {
            agentName: "CareerGapAnalyst",
            executedAt: new Date().toISOString(),
            durationMs: 380,
            usedFallback: true,
            inputSummary: "Target: Full Stack Developer. Readiness: 42%.",
            keyFindings: [
              "Top employability bottleneck: unverified JavaScript runtime foundation.",
              "SQL level deficit of 1 requires JOIN and GROUP BY reconstruction.",
            ],
          },
          {
            agentName: "LearningPlanner",
            executedAt: new Date().toISOString(),
            durationMs: 650,
            usedFallback: true,
            inputSummary: "Synthesizing 5-phase DAG roadmap.",
            keyFindings: [
              "Phase 1 unlocked: SQL remediation.",
              "Phase 2-5 locked behind respective prerequisite modules.",
            ],
          },
        ],
      },
    });
  };

  const loadPreset3 = () => {
    loadPreset2();
    dispatch({ type: "LOAD_PRESET", presetNumber: 3 });
  };

  const loadPreset4 = () => {
    loadPreset2();
    dispatch({ type: "LOAD_PRESET", presetNumber: 4 });
  };

  if (!state.presenterStripOpen) {
    return (
      <div className="bg-[#18191B] border-b border-[#323538] px-4 py-1.5 flex items-center justify-between text-[#F7F8F7] text-[13px] tabular-nums">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wide text-[#ECEEED]">SKILLPATH INSTRUMENT</span>
          <span className="text-[#9BA19F]">
            {state.activeStage === 0 ? "Overview" : `Stage ${state.activeStage} of 8`}
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: "TOGGLE_PRESENTER_STRIP" })}
          className="text-[#C5C9C7] hover:text-white px-2 py-0.5 border border-[#323538] text-[12px] rounded-[4px] cursor-pointer"
          title="Toggle Presenter Strip (Alt+P)"
        >
          Show presenter bar (Alt+P)
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#18191B] border-b border-[#323538] text-[#F7F8F7] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-[#F7F8F7]">SKILLPATH AI</span>
            <span className="text-[#9BA19F] text-[12px] border-l border-[#323538] pl-2">
              Presenter Tooling
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={loadPreset1}
              className={`px-2.5 py-1 rounded-[4px] border text-[12px] cursor-pointer transition-colors ${
                state.activeStage === 2
                  ? "bg-[#2A2E30] border-[#5F6563] text-white font-medium"
                  : "bg-transparent border-[#323538] text-[#C5C9C7] hover:bg-[#232628] hover:text-white"
              }`}
            >
              Preset 1: Onboarding & consent
            </button>

            <button
              onClick={loadPreset2}
              className={`px-2.5 py-1 rounded-[4px] border text-[12px] cursor-pointer transition-colors ${
                state.activeStage === 4
                  ? "bg-[#2A2E30] border-[#5F6563] text-white font-medium"
                  : "bg-transparent border-[#323538] text-[#C5C9C7] hover:bg-[#232628] hover:text-white"
              }`}
            >
              Preset 2: Calibration & radar
            </button>

            <button
              onClick={loadPreset3}
              className={`px-2.5 py-1 rounded-[4px] border text-[12px] cursor-pointer transition-colors ${
                state.activeStage === 6
                  ? "bg-[#2A2E30] border-[#5F6563] text-white font-medium"
                  : "bg-transparent border-[#323538] text-[#C5C9C7] hover:bg-[#232628] hover:text-white"
              }`}
            >
              Preset 3: Failed checkpoint
            </button>

            <button
              onClick={loadPreset4}
              className={`px-2.5 py-1 rounded-[4px] border text-[12px] cursor-pointer transition-colors ${
                state.activeStage === 8
                  ? "bg-[#2A2E30] border-[#5F6563] text-white font-medium"
                  : "bg-transparent border-[#323538] text-[#C5C9C7] hover:bg-[#232628] hover:text-white"
              }`}
            >
              Preset 4: Career pivot
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleReducedMotion}
            className="text-[#C5C9C7] hover:text-white px-2 py-1 border border-[#323538] text-[12px] rounded-[4px] cursor-pointer"
            title="Toggle Accessible Motion"
          >
            Motion: {reducedMotion ? "Reduced" : "Default"}
          </button>

          <button
            onClick={handleRunSelfTest}
            disabled={isRunningTest}
            className="px-2.5 py-1 bg-[#146348] text-[#F7F8F7] hover:bg-[#187556] rounded-[4px] text-[12px] font-medium cursor-pointer disabled:opacity-50"
          >
            {isRunningTest ? "Running test suite..." : "Run server self-test (10 stages)"}
          </button>

          <button
            onClick={() => dispatch({ type: "TOGGLE_PRESENTER_STRIP" })}
            className="text-[#9BA19F] hover:text-white px-1.5 py-0.5 border border-[#323538] text-[12px] rounded-[4px] cursor-pointer"
            title="Collapse Presenter Strip (Alt+P)"
          >
            Hide (Alt+P)
          </button>
        </div>
      </div>

      {/* Self-Test Results Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#F7F8F7] text-[#18191B] border border-[#18191B] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-[4px]">
            <div className="bg-[#18191B] text-[#F7F8F7] px-4 py-3 flex items-center justify-between border-b border-[#323538]">
              <div>
                <h3 className="text-[15px] font-semibold">Server-Side Test Pipeline Assertions</h3>
                <p className="text-[12px] text-[#9BA19F]">
                  10-Stage Automated Verification of Alex Chen's Engineering Journey
                </p>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-[#9BA19F] hover:text-white text-[12px] px-2 py-0.5 border border-[#323538] rounded-[2px] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-[13px]">
              {isRunningTest && (
                <div className="p-8 text-center text-[#5F6563]">
                  <p className="font-medium">Executing automated server assertions...</p>
                  <p className="text-[12px] text-[#5F6563] mt-1">
                    Validating consent gate, adaptive questions, cognitive scoring, DAG splicing, recovery, and pivot ledger.
                  </p>
                </div>
              )}

              {testError && (
                <div className="p-3 bg-[#F6E6E3] border border-[#B8351E] text-[#B8351E] rounded-[4px]">
                  <span className="font-semibold">Execution error:</span> {testError}
                </div>
              )}

              {testResults && (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C5C9C7]">
                    <span className="font-semibold">
                      Summary: {testResults.summary.passedStages} / {testResults.summary.totalStages} stages passed
                    </span>
                    <span className="text-[#5F6563] tabular-nums">
                      Duration: {testResults.durationMs}ms
                    </span>
                  </div>

                  <div className="space-y-2">
                    {testResults.stages.map((st, i) => (
                      <div
                        key={i}
                        className={`p-2.5 border rounded-[4px] ${
                          st.passed
                            ? "bg-[#E4EFEA] border-[#146348] text-[#18191B]"
                            : "bg-[#F6E6E3] border-[#B8351E] text-[#B8351E]"
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span>{st.stage}</span>
                          <span className="text-[12px] font-bold">
                            {st.passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#5F6563] mt-1 font-serif-reading">
                          {st.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#ECEEED] px-4 py-2.5 border-t border-[#C5C9C7] flex justify-end">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-3 py-1 bg-[#18191B] text-[#F7F8F7] hover:bg-[#323538] text-[13px] rounded-[4px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
