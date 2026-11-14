"use client";

import React, { useEffect, useState } from "react";
import { PROFICIENCY_RANK, type ProficiencyLevel } from "@/lib/schemas/domain.schema";
import { formatCalibrationDelta, formatProficiency } from "@/lib/format";

interface CalibrationRulerProps {
  skillId: string;
  skillName: string;
  claimedLevel: ProficiencyLevel;
  validatedLevel: ProficiencyLevel;
  requiredLevel?: ProficiencyLevel;
  calibrationDelta: number;
  assessmentScore?: number;
}

const TICKS: { level: ProficiencyLevel; label: string; pct: number }[] = [
  { level: "none", label: "None", pct: 0 },
  { level: "beginner", label: "Beginner", pct: 33.33 },
  { level: "intermediate", label: "Intermediate", pct: 66.66 },
  { level: "advanced", label: "Advanced", pct: 100 },
];

export function CalibrationRuler({
  skillId,
  skillName,
  claimedLevel,
  validatedLevel,
  requiredLevel = "intermediate",
  calibrationDelta,
  assessmentScore,
}: CalibrationRulerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount trigger for 420ms slide animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const claimedRank = PROFICIENCY_RANK[claimedLevel] ?? 0;
  const validatedRank = PROFICIENCY_RANK[validatedLevel] ?? 0;
  const requiredRank = PROFICIENCY_RANK[requiredLevel] ?? 2;

  const claimedPct = (claimedRank / 3) * 100;
  const validatedPct = (validatedRank / 3) * 100;
  const requiredPct = (requiredRank / 3) * 100;

  const minPct = Math.min(claimedPct, validatedPct);
  const spanPct = Math.abs(validatedPct - claimedPct);

  const isOverconfident = validatedRank < claimedRank;
  const isUnderconfident = validatedRank > claimedRank;
  const isCalibrated = validatedRank === claimedRank;

  // Hatch stroke color
  const hatchColor = isOverconfident ? "#B8351E" : isUnderconfident ? "#146348" : "transparent";

  // Initial marker starts at claimedPct, then slides to validatedPct
  const currentVerifiedPct = mounted ? validatedPct : claimedPct;

  return (
    <div className="border-t border-b border-[var(--rule)] bg-[var(--surface)] py-3 px-4 my-2">
      {/* Header Info */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[14px] text-[var(--ink)]">{skillName}</span>
          {assessmentScore !== undefined && (
            <span className="text-[12px] tabular-nums font-mono px-1.5 py-0.5 bg-[var(--surface-recessed)] text-[var(--ink)]">
              {assessmentScore}% score
            </span>
          )}
        </div>

        <div className="text-[12px] text-[var(--pencil)] font-serif-reading">
          {formatCalibrationDelta(calibrationDelta)}
        </div>
      </div>

      {/* SVG Instrument Track */}
      <div className="relative w-full h-[52px]">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 52"
        >
          <defs>
            {/* Diagonal Hatch Pattern */}
            <pattern
              id={`hatch-${skillId}`}
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke={hatchColor}
                strokeWidth="1.5"
              />
            </pattern>
          </defs>

          {/* Baseline Ruler */}
          <line
            x1="0"
            y1="26"
            x2="100"
            y2="26"
            stroke="var(--ink)"
            strokeWidth="1"
          />

          {/* Gap Span Hatch Rect */}
          {spanPct > 0 && (
            <rect
              x={minPct}
              y="16"
              width={spanPct}
              height="20"
              fill={`url(#hatch-${skillId})`}
              opacity="0.75"
            />
          )}

          {/* Major Ticks */}
          {TICKS.map((t) => (
            <g key={t.level}>
              <line
                x1={t.pct}
                y1="18"
                x2={t.pct}
                y2="34"
                stroke="var(--rule)"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Career Requirement Target Tick */}
          <line
            x1={requiredPct}
            y1="8"
            x2={requiredPct}
            y2="44"
            stroke="#18191B"
            strokeWidth="2"
          />
        </svg>

        {/* Career Target Label */}
        <div
          className="absolute top-0 text-[10px] uppercase font-mono font-bold text-[var(--ink)] -translate-x-1/2 pointer-events-none"
          style={{ left: `${requiredPct}%` }}
        >
          Target
        </div>

        {/* Claimed Marker (Hollow dashed) */}
        <div
          className="absolute top-[20px] w-[12px] h-[12px] rounded-[50%] border-[1.5px] border-dashed border-[var(--pencil)] bg-[var(--surface)] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${claimedPct}%` }}
          title={`Claimed: ${formatProficiency(claimedLevel)}`}
        />

        {/* Verified Marker (Solid Viridian with slide transition) */}
        <div
          className="absolute top-[20px] w-[12px] h-[12px] rounded-[50%] bg-[var(--viridian)] -translate-x-1/2 -translate-y-1/2 ruler-marker-slide"
          style={{ left: `${currentVerifiedPct}%` }}
          title={`Verified: ${formatProficiency(validatedLevel)}`}
        />

        {/* Tick Labels */}
        <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] text-[var(--pencil)] font-mono pointer-events-none">
          {TICKS.map((t) => (
            <span
              key={t.level}
              className={`${
                t.pct === 0
                  ? "text-left"
                  : t.pct === 100
                  ? "text-right"
                  : "text-center -translate-x-1/2"
              }`}
              style={{
                position: t.pct === 0 || t.pct === 100 ? "static" : "absolute",
                left: t.pct !== 0 && t.pct !== 100 ? `${t.pct}%` : undefined,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

