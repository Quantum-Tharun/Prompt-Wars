"use client";

import React, { useEffect, useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";

interface StageFrameProps {
  title: string;
  subtitle: string;
  stageNumber: number;
  children: React.ReactNode;
}

export function StageFrame({
  title,
  subtitle,
  stageNumber,
  children,
}: StageFrameProps) {
  const { state } = useSkillPath();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.isLoading && state.requestStartTime) {
      interval = setInterval(() => {
        setElapsed(Date.now() - state.requestStartTime!);
      }, 100);
    } else {
      setElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isLoading, state.requestStartTime]);

  return (
    <div className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-[960px] mx-auto w-full">
      {/* Header bar */}
      <header className="border-b border-[var(--rule)] pb-4 mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-[var(--pencil)]">
              STAGE {stageNumber} OF 7
            </span>
          </div>

          {state.isLoading && elapsed > 1000 && (
            <div className="text-[12px] text-[var(--pencil)] tabular-nums font-mono">
              Computing: {(elapsed / 1000).toFixed(1)}s
            </div>
          )}
        </div>

        <h1 className="text-[24px] md:text-[28px] font-bold text-[var(--ink)] tracking-tight mt-1">
          {title}
        </h1>
        <p className="text-[14px] text-[var(--pencil)] mt-1 font-serif-reading leading-relaxed">
          {subtitle}
        </p>
      </header>

      {/* Loading Skeleton Guard */}
      {state.isLoading ? (
        <div className="space-y-4">
          <div className="p-4 border border-[var(--rule)] bg-[var(--surface)] text-[13px] flex items-center justify-between">
            <span className="font-medium text-[var(--ink)]">{state.loadingMessage || "Processing calibration..."}</span>
            <span className="text-[12px] text-[var(--pencil)] tabular-nums font-mono">
              {(elapsed / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="h-[120px] bg-[var(--surface-recessed)] rounded-[0px] border border-[var(--rule)]" />
          <div className="h-[220px] bg-[var(--surface-recessed)] rounded-[0px] border border-[var(--rule)]" />
          <div className="h-[80px] bg-[var(--surface-recessed)] rounded-[0px] border border-[var(--rule)]" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

