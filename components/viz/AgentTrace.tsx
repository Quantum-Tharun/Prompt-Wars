"use client";

import React from "react";
import { type AgentTraceEntry } from "@/lib/schemas/domain.schema";

interface AgentTraceProps {
  traces: AgentTraceEntry[];
}

export function AgentTrace({ traces }: AgentTraceProps) {
  if (!traces || traces.length === 0) {
    return (
      <div className="p-3 border border-dashed border-[var(--rule)] bg-[var(--surface)] text-[12px] text-[var(--pencil)]">
        No active agent telemetry recorded. Run validation or orchestration to capture multi-agent trace.
      </div>
    );
  }

  return (
    <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 my-4">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--rule)]">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--ink)]">
            Multi-Agent Execution Telemetry
          </h3>
          <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
            Parallel Gemini 2.5 Flash agent cluster with 5000ms deterministic circuit breakers.
          </p>
        </div>
        <span className="text-[11px] font-mono text-[var(--pencil)]">
          {traces.length} AGENTS ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {traces.map((t, idx) => (
          <div
            key={idx}
            className="border border-[var(--rule)] bg-[var(--paper)] p-3 rounded-[0px] text-[12px] space-y-2"
          >
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-1.5">
              <span className="font-bold text-[var(--ink)] font-mono">{t.agentName}</span>
              <span className="tabular-nums text-[11px] text-[var(--pencil)] font-mono">
                {t.durationMs}ms
              </span>
            </div>

            {t.usedFallback && (
              <div className="p-1.5 bg-[var(--surface)] border border-[var(--rule)] text-[11px] text-[var(--pencil)] font-serif-reading">
                Computed locally. The AI service did not answer within 5 seconds.
              </div>
            )}

            <div className="text-[var(--pencil)] text-[11px]">
              <span className="text-[var(--ink)] font-medium">Input context:</span> {t.inputSummary}
            </div>

            {t.keyFindings && t.keyFindings.length > 0 && (
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[var(--ink)] font-serif-reading">
                {t.keyFindings.map((finding, fIdx) => (
                  <li key={fIdx}>{finding}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

