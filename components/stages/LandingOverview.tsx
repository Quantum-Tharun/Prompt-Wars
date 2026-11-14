"use client";

import React from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { GradientASCII } from "@/components/viz/GradientASCII";
import { PRESET_2_CALIBRATED } from "@/lib/demo-presets";
import { SAMPLE_FULLSTACK_GAP_MATRIX, SAMPLE_FULLSTACK_ROADMAP } from "@/lib/client-presets";

export function LandingOverview() {
  const { dispatch } = useSkillPath();

  const handleStartDiscovery = () => {
    dispatch({ type: "SET_ACTIVE_STAGE", stage: 1 });
  };

  const handleLoadDemo = () => {
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

  return (
    <div className="w-full">
      {/* Framed 0px-radius Drafting ASCII Header */}
      <div className="relative w-full h-[300px] border-b border-[var(--rule)] bg-[var(--paper)] overflow-hidden">
        <GradientASCII
          cellSize={14}
          characters=" =+xX0S8#@"
          colors={["#ECEEED", "#C5C9C7", "#5F6563", "#146348", "#18191B"]}
          density={0.75}
          flicker={0.08}
          flow={0.35}
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          glow={0}
          glyphOpacity={0.7}
          gradientOpacity={0.18}
          grain={0.05}
          intro={true}
          lightMode={true}
          mouseInteraction={true}
          scale={1.1}
          scrambleRadius={0.12}
          shape="horizon"
          softness={0.6}
          speed={0.6}
          clickEffect="wave"
          className="absolute inset-0"
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-12 pointer-events-none">
          <div className="max-w-2xl space-y-3">
            <div className="text-[12px] font-mono text-[var(--pencil)] uppercase tracking-wider">
              Calibration Instrument & Field Drafting Notebook
            </div>
            <h1 className="text-[26px] md:text-[34px] font-bold text-[var(--ink)] tracking-tight leading-tight">
              Measure what you actually know before building your career roadmap
            </h1>
            <p className="text-[14px] text-[var(--pencil)] font-serif-reading leading-relaxed">
              SkillPath AI is an empirical calibration instrument. It cross-checks self-reported claims against consented code footprints, subjects concepts to adaptive cognitive testing, and calculates the exact distance to your target engineering role.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 pointer-events-auto">
              <button
                onClick={handleStartDiscovery}
                className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
              >
                Begin skill discovery (Stage 1)
              </button>

              <button
                onClick={handleLoadDemo}
                className="px-4 py-2.5 border border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--paper)] rounded-[4px] text-[13px] font-medium cursor-pointer"
              >
                Load Alex Chen demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Instrument Verification Summary */}
      <div className="p-6 md:p-8 max-w-[960px] mx-auto space-y-6">
        <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">
            The 3-Vector Calibration Model
          </h2>
          <span className="text-[11px] font-mono text-[var(--pencil)]">
            EMPIRICAL VALIDATION ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
          {/* Vector 1 */}
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <span className="font-bold text-[var(--ink)]">Vector 1: Self-Claims</span>
              <span className="text-[11px] font-mono text-[var(--pencil)]">STAGE 1</span>
            </div>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading leading-relaxed">
              Learners self-report proficiency across fundamental languages, databases, and frameworks. These claims form unverified hypotheses.
            </p>
          </div>

          {/* Vector 2 */}
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <span className="font-bold text-[var(--ink)]">Vector 2: Code Footprint</span>
              <span className="text-[11px] font-mono text-[var(--pencil)]">STAGE 2</span>
            </div>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading leading-relaxed">
              Consent-gated queries evaluate GitHub repositories, commit distributions, and course certificates, returning 403 when permission is refused.
            </p>
          </div>

          {/* Vector 3 */}
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2">
              <span className="font-bold text-[var(--ink)]">Vector 3: Cognitive Staircase</span>
              <span className="text-[11px] font-mono text-[var(--pencil)]">STAGE 3</span>
            </div>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading leading-relaxed">
              3-question adaptive diagnostic evaluating conceptual recall (1x), execution tracing (2x), and scenario debugging (3x) with latency anomaly guards.
            </p>
          </div>
        </div>

        {/* Closed-Loop Adaptation Preview */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-3">
          <div className="border-b border-[var(--rule)] pb-2 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[var(--ink)]">
              Closed-Loop Adaptation & Career Mobility
            </h3>
            <span className="text-[11px] font-mono text-[var(--viridian)] font-bold">
              ZERO AI SLOP
            </span>
          </div>

          <p className="text-[13px] text-[var(--pencil)] font-serif-reading leading-relaxed">
            When a checkpoint quiz score falls below 60%, the Adaptation Engine dynamically rewires the DAG, splicing a targeted remediation module and locking downstream gates until 100% recovery mastery is demonstrated. If you decide to switch career tracks, the Skill Capital Preservation Ledger carries over verified capabilities at 100% credit, saving 15 to 20 redundant curriculum hours.
          </p>

          <div className="pt-2 flex justify-start">
            <button
              onClick={handleStartDiscovery}
              className="px-4 py-2 bg-[var(--ink)] text-[var(--surface)] hover:bg-[#323538] rounded-[4px] text-[12px] font-medium cursor-pointer"
            >
              Start onboarding & platform discovery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

