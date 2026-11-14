"use client";

import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PROFICIENCY_RANK, type SkillValidationRecord } from "@/lib/schemas/domain.schema";
import { formatProficiency } from "@/lib/format";
import careersCatalogue from "@/data/careers.json";

interface GapRadarProps {
  validatedSkills: SkillValidationRecord[];
  targetCareerId: string;
}

export function GapRadar({ validatedSkills, targetCareerId }: GapRadarProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [viewAsTable, setViewAsTable] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const careerReqs = careersCatalogue.find((c) => c.id === targetCareerId)?.requirements || [];

  const chartData = validatedSkills.map((s) => {
    const claimedRank = PROFICIENCY_RANK[s.selfReportedLevel] ?? 0;
    const validatedRank = PROFICIENCY_RANK[s.validatedLevel] ?? 0;
    const req = careerReqs.find((r) => r.skillId === s.skillId);
    const targetRank = req ? PROFICIENCY_RANK[req.requiredLevel as keyof typeof PROFICIENCY_RANK] : 2;

    return {
      skill: s.skillName || s.skillId,
      claimed: claimedRank,
      validated: validatedRank,
      target: targetRank,
      claimedLabel: formatProficiency(s.selfReportedLevel),
      validatedLabel: formatProficiency(s.validatedLevel),
      targetLabel: formatProficiency(req?.requiredLevel || "intermediate"),
    };
  });

  return (
    <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 my-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--rule)]">
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Triangulated Skill Geometry
          </h3>
          <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
            Self-Reported vs Empirically Validated vs Career Benchmark
          </p>
        </div>

        <button
          onClick={() => setViewAsTable(!viewAsTable)}
          className="text-[12px] px-2.5 py-1 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--surface-recessed)] rounded-[4px] cursor-pointer"
        >
          {viewAsTable ? "View as radar chart" : "View as data table"}
        </button>
      </div>

      {viewAsTable ? (
        <div className="overflow-x-auto text-[12px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-recessed)] border-b border-[var(--rule)] text-[var(--ink)]">
                <th className="p-2 font-medium">Skill</th>
                <th className="p-2 font-medium">Self-Reported</th>
                <th className="p-2 font-medium">Validated</th>
                <th className="p-2 font-medium">Target Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[var(--pencil)]">
              {chartData.map((row) => (
                <tr key={row.skill}>
                  <td className="p-2 font-medium text-[var(--ink)]">{row.skill}</td>
                  <td className="p-2">{row.claimedLabel}</td>
                  <td className="p-2 font-semibold text-[var(--viridian)]">
                    {row.validatedLabel}
                  </td>
                  <td className="p-2 font-medium text-[var(--ink)]">{row.targetLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-[320px]">
          {hasMounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#C5C9C7" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#18191B", fontSize: 12, fontFamily: "var(--font-sans)" }}
                />
                <PolarRadiusAxis
                  domain={[0, 3]}
                  tickCount={4}
                  tick={{ fill: "#5F6563", fontSize: 10 }}
                  axisLine={false}
                />
                {/* Self-reported: Graphite dashed */}
                <Radar
                  name="Self-Reported"
                  dataKey="claimed"
                  stroke="#5F6563"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeWidth={2}
                />
                {/* Verified: Viridian solid */}
                <Radar
                  name="Verified"
                  dataKey="validated"
                  stroke="#146348"
                  fill="#146348"
                  fillOpacity={0.16}
                  strokeWidth={2}
                />
                {/* Career Target: Carbon solid */}
                <Radar
                  name="Career Target"
                  dataKey="target"
                  stroke="#18191B"
                  fill="none"
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--pencil)] text-[13px]">
              No validated skills to plot.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 mt-2 text-[12px] text-[var(--pencil)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#5F6563]" />
              <span>Self-Reported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-[#146348]/20 border border-[#146348]" />
              <span className="font-medium text-[var(--viridian)]">Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#18191B]" />
              <span className="text-[var(--ink)]">Career Target</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

