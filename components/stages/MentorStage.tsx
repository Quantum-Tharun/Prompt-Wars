"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { apiClient } from "@/lib/api/client";
import { PrerequisiteRail } from "@/components/viz/PrerequisiteRail";
import questionsCatalogue from "@/data/questions.json";

export function MentorStage() {
  const { state, dispatch } = useSkillPath();
  const [failingSimulated, setFailingSimulated] = useState(false);
  const [recoverySimulated, setRecoverySimulated] = useState(false);

  if (!state.roadmap) {
    return (
      <StageFrame
        stageNumber={6}
        title="Adaptive Mentor Intervention & Gate Unlock"
        subtitle="Surgical remediation node splicing and dynamic prerequisite gate enforcement."
      >
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-8 text-center space-y-4">
          <div className="text-[14px] font-semibold text-[var(--ink)]">
            No active learning roadmap to adapt
          </div>
          <p className="text-[13px] text-[var(--pencil)] font-serif-reading max-w-md mx-auto">
            You must have an active roadmap to run the Adaptive Mentor simulation.
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

  // Real JS question IDs from data/questions.json: js_q1, js_q2, js_q3
  const handleSimulateFailure = async () => {
    if (!state.roadmap) return;
    dispatch({
      type: "START_LOADING",
      message: "Submitting failing JavaScript checkpoint (35% score) to Adaptive Mentor...",
    });

    try {
      // Simulate Alex answering js_q1 correct (opt_b = index 1), js_q2 incorrect, js_q3 incorrect
      const failingAnswers = [
        { questionId: "js_q1", selectedIndex: 1 }, // correct
        { questionId: "js_q2", selectedIndex: 0 }, // wrong (correct is opt_b = 1)
        { questionId: "js_q3", selectedIndex: 2 }, // wrong (correct is opt_a = 0)
      ];

      const res = await apiClient.adaptCheckpointFailure(
        state.roadmap,
        "javascript",
        failingAnswers
      );

      dispatch({ type: "SET_MENTOR_ADAPT_DATA", payload: res });
      dispatch({ type: "STOP_LOADING" });
      setFailingSimulated(true);
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Adaptation error: ${err.message}`);
    }
  };

  const handleSimulateRecovery = async () => {
    if (!state.roadmap) return;
    dispatch({
      type: "START_LOADING",
      message: "Submitting 100% recovery quiz to verify JavaScript remediation mastery...",
    });

    try {
      // 100% correct answers
      const passingAnswers = [
        { questionId: "js_q1", selectedIndex: 1 },
        { questionId: "js_q2", selectedIndex: 1 },
        { questionId: "js_q3", selectedIndex: 0 },
      ];

      const remediationId =
        state.insertedRemediationModule?.moduleId || "remediation_javascript_async";

      const res = await apiClient.verifyRecoveryQuiz(
        state.roadmap,
        "javascript",
        remediationId,
        state.validatedSkills,
        passingAnswers
      );

      dispatch({ type: "SET_MENTOR_VERIFY_DATA", payload: res });
      dispatch({ type: "STOP_LOADING" });
      setRecoverySimulated(true);
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Recovery verification error: ${err.message}`);
    }
  };

  const reactModule = state.roadmap.modules.find((m) => m.skillId === "react");
  const isReactLocked = reactModule?.status === "locked";

  return (
    <StageFrame
      stageNumber={6}
      title="Adaptive Mentor Intervention & Gate Unlock"
      subtitle="Experience the closed-loop adaptation cycle: Checkpoint failure (<60%) splices a surgical remediation node and locks downstream gates, while 100% mastery unlocks the track."
    >
      <div className="space-y-6">
        {/* Interactive Simulation Controls */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                Active Checkpoint: Module 2 (Modern JavaScript Core)
              </h2>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Phase 3 React component architecture is currently blocked pending JS runtime mastery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-[2px] ${
                isReactLocked
                  ? "bg-[var(--vermilion-tint)] text-[var(--vermilion)] border border-[var(--vermilion)]"
                  : "bg-[var(--viridian-tint)] text-[var(--viridian)] border border-[var(--viridian)]"
              }`}>
                Phase 3 React: {isReactLocked ? "Gate Locked" : "Gate Unlocked"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Trigger Failure */}
            <div className="border border-[var(--rule)] p-4 bg-[var(--paper)] rounded-[0px] space-y-2">
              <div className="text-[12px] font-mono font-bold text-[var(--vermilion)] uppercase">
                Step 1: Checkpoint Failure
              </div>
              <div className="text-[13px] font-semibold text-[var(--ink)]">
                Simulate Alex Scoring 35% on JS Event Loop
              </div>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Submits real answers failing event loop and promise resolution, triggering Agent 4 and surgical DAG mutation.
              </p>
              <button
                onClick={handleSimulateFailure}
                className="w-full mt-2 px-3 py-2 bg-[var(--vermilion)] text-white hover:bg-[#9E2B16] rounded-[4px] text-[12px] font-medium cursor-pointer"
              >
                Simulate 35% failure & splice DAG
              </button>
            </div>

            {/* Step 2: Trigger Recovery */}
            <div className="border border-[var(--rule)] p-4 bg-[var(--paper)] rounded-[0px] space-y-2">
              <div className="text-[12px] font-mono font-bold text-[var(--viridian)] uppercase">
                Step 2: Remediation Mastery
              </div>
              <div className="text-[13px] font-semibold text-[var(--ink)]">
                Complete Recovery Quiz (100% Score)
              </div>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Submits verified answers to unlock Phase 3 React and dynamically jump Career Readiness.
              </p>
              <button
                onClick={handleSimulateRecovery}
                className="w-full mt-2 px-3 py-2 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[12px] font-medium cursor-pointer"
              >
                Verify 100% recovery & unlock gate
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Before/After Diff Callout */}
        {state.postRecoveryReadiness && (
          <div className="border border-[var(--viridian)] bg-[var(--viridian-tint)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]">
            <div>
              <span className="font-bold text-[var(--viridian)]">Gate Unlock Verified:</span>{" "}
              Phase 3 React is now accessible. Downstream rail segment transitioned to solid.
            </div>
            <div className="font-mono text-[14px] font-bold text-[var(--ink)] tabular-nums">
              Readiness: {state.preRecoveryReadiness}% → {state.postRecoveryReadiness}% (+19%)
            </div>
          </div>
        )}

        {/* Agent 4 Coaching Narrative Box */}
        {state.mentorCoaching && (
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-3">
            <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[var(--ink)]">
                  Agent 4 Adaptive Mentor Diagnosis
                </h3>
                <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                  {state.mentorCoaching.diagnosisHeadline}
                </p>
              </div>
              <span className="text-[11px] font-mono text-[var(--pencil)]">
                SCORE: {state.checkpointScore}%
              </span>
            </div>

            <div className="space-y-3">
              {state.mentorCoaching.conceptBreakdowns.map((concept, idx) => (
                <div key={idx} className="p-3 bg-[var(--paper)] border border-[var(--rule)] text-[12px] space-y-1">
                  <div className="font-bold text-[var(--ink)]">
                    Weak Concept: {concept.topicTag}
                  </div>
                  <div className="text-[var(--pencil)] font-serif-reading">
                    <strong className="text-[var(--ink)]">Why it matters:</strong> {concept.whyItMatters}
                  </div>
                  <div className="text-[var(--viridian)] font-serif-reading pt-0.5">
                    <strong className="text-[var(--viridian)]">Mental Model Tip:</strong> {concept.mentalModelTip}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[var(--surface-recessed)] text-[12px] font-serif-reading text-[var(--ink)]">
              <strong className="font-bold text-[var(--ink)]">Roadmap Mutation:</strong>{" "}
              {state.mentorCoaching.roadmapMutationExplanation}
            </div>
          </div>
        )}

        {/* Mutated DAG Roadmap Track */}
        <PrerequisiteRail roadmap={state.roadmap} />

        {/* Navigation Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_STAGE", stage: 7 })}
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
          >
            Evaluate career switch & skill ledger (Stage 7)
          </button>
        </div>
      </div>
    </StageFrame>
  );
}
