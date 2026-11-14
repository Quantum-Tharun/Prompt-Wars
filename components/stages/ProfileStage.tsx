"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { apiClient } from "@/lib/api/client";
import careersCatalogue from "@/data/careers.json";
import skillsCatalogue from "@/data/skills.json";
import { formatProficiency } from "@/lib/format";

export function ProfileStage() {
  const { state, dispatch } = useSkillPath();
  const [name, setName] = useState(state.background.name);
  const [educationLevel, setEducationLevel] = useState(state.background.educationLevel);
  const [fieldOfStudy, setFieldOfStudy] = useState(state.background.fieldOfStudy);
  const [hasPriorProjects, setHasPriorProjects] = useState(state.background.hasPriorProjects);
  const [weeklyHours, setWeeklyHours] = useState(state.background.weeklyLearningHours);
  const [targetCareerId, setTargetCareerId] = useState(state.background.targetCareerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "START_LOADING", message: "Registering learner profile and claims..." });

    const updatedBackground = {
      ...state.background,
      name,
      educationLevel,
      fieldOfStudy,
      hasPriorProjects,
      weeklyLearningHours: weeklyHours,
      targetCareerId,
    };

    dispatch({ type: "UPDATE_BACKGROUND", patch: updatedBackground });

    try {
      await apiClient.initProfile(updatedBackground, state.claims);
      dispatch({ type: "STOP_LOADING" });
      dispatch({ type: "SET_ACTIVE_STAGE", stage: 2 });
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Initialization error: ${err.message}`);
    }
  };

  return (
    <StageFrame
      stageNumber={1}
      title="Learner Profile & Calibration Goals"
      subtitle="Register your academic background, available commitment hours, and target engineering trajectory."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background Information Ruled Box */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Learner Identity & Credentials
            </h2>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
              Baseline educational context used by the Diagnostic Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block text-[12px] font-medium text-[var(--ink)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] rounded-[4px] focus:outline-none focus:border-[var(--viridian)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--ink)] mb-1">
                Education Level
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] rounded-[4px] focus:outline-none focus:border-[var(--viridian)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--ink)] mb-1">
                Field of Study
              </label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] rounded-[4px] focus:outline-none focus:border-[var(--viridian)]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="priorProjects"
                checked={hasPriorProjects}
                onChange={(e) => setHasPriorProjects(e.target.checked)}
                className="w-4 h-4 text-[var(--viridian)] border-[var(--rule)] rounded-[2px]"
              />
              <label htmlFor="priorProjects" className="text-[12px] text-[var(--ink)] font-medium cursor-pointer">
                Has built independent software projects
              </label>
            </div>
          </div>
        </div>

        {/* Weekly Hours Slider */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                Weekly Learning Capacity
              </h2>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Determines projected roadmap velocity and completion schedules.
              </p>
            </div>
            <div className="text-[20px] font-bold text-[var(--ink)] tabular-nums font-mono">
              {weeklyHours} hrs/wk
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="w-full accent-[var(--viridian)] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[var(--pencil)] font-mono">
            <span>1 hr (Slow pace)</span>
            <span>20 hrs (Part-time)</span>
            <span>40 hrs (Full-time intensive)</span>
          </div>
        </div>

        {/* Target Career Track Selector */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-4">
          <div className="border-b border-[var(--rule)] pb-2">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
              Target Career Benchmark
            </h2>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
              Select the production engineering role to calibrate your skills against.
            </p>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label="Target Career Tracks">
            {careersCatalogue.map((career) => {
              const isSelected = targetCareerId === career.id;

              return (
                <div
                  key={career.id}
                  onClick={() => setTargetCareerId(career.id as any)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`p-4 border rounded-[4px] cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[2px] border-[var(--ink)] bg-[var(--paper)]"
                      : "border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--paper)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--pencil)]"
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--surface)]" />}
                        </span>
                        <span className="text-[14px] font-bold text-[var(--ink)]">
                          {career.title}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--pencil)] font-serif-reading mt-1 pl-5.5">
                        {career.description}
                      </p>
                    </div>
                  </div>

                  {/* Required skills preview */}
                  <div className="mt-3 pl-5.5 flex flex-wrap gap-1.5">
                    {career.requirements.map((req) => {
                      const skillObj = skillsCatalogue.find((s) => s.id === req.skillId);
                      return (
                        <span
                          key={req.skillId}
                          className="text-[11px] font-mono px-2 py-0.5 border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)]"
                        >
                          {skillObj?.name || req.skillId}: {formatProficiency(req.requiredLevel)} ({req.weight}x)
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
          >
            Continue to platform connect
          </button>
        </div>
      </form>
    </StageFrame>
  );
}

