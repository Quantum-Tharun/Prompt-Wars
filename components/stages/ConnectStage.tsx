"use client";

import React, { useState } from "react";
import { useSkillPath } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatProficiency } from "@/lib/format";
import { type StagedCandidateSkill } from "@/lib/schemas/domain.schema";

interface PlatformRowState {
  platform: "github" | "linkedin" | "leetcode" | "kaggle";
  name: string;
  scopeDesc: string;
}

const PLATFORMS: PlatformRowState[] = [
  { platform: "github", name: "GitHub", scopeDesc: "Public repositories, commit logs, language ratios" },
  { platform: "linkedin", name: "LinkedIn", scopeDesc: "Skill assessments, course completion certificates" },
  { platform: "leetcode", name: "LeetCode", scopeDesc: "Solved problem counts, topic tags, acceptance stats" },
  { platform: "kaggle", name: "Kaggle", scopeDesc: "Competitions, public notebooks, dataset contributions" },
];

export function ConnectStage() {
  const { state, dispatch } = useSkillPath();
  const [unconsentedRefusedMessage, setUnconsentedRefusedMessage] = useState<string | null>(null);
  const [activeSyncMessage, setActiveSyncMessage] = useState<string | null>(null);

  const getEnvelope = (platform: string) => {
    return state.consentEnvelopes.find((e) => e.platform === platform);
  };

  const handleConsentToggle = (platform: "github" | "linkedin" | "leetcode" | "kaggle", checked: boolean) => {
    dispatch({
      type: "UPDATE_SINGLE_CONSENT",
      platform,
      consentGranted: checked,
    });
    setUnconsentedRefusedMessage(null);
  };

  const handleAccountChange = (platform: "github" | "linkedin" | "leetcode" | "kaggle", account: string) => {
    dispatch({
      type: "UPDATE_SINGLE_CONSENT",
      platform,
      consentGranted: getEnvelope(platform)?.consentGranted ?? false,
      accountIdentifier: account,
    });
  };

  // Test unconsented request to verify 403 guardrail
  const handleTestUnconsented = async () => {
    dispatch({ type: "START_LOADING", message: "Sending unconsented query to test 403 guardrail..." });
    setUnconsentedRefusedMessage(null);

    try {
      await apiClient.connectPlatforms(state.background.learnerId, [
        {
          platform: "github",
          consentGranted: false, // Refused
          consentedAt: new Date().toISOString(),
          authorizedScopes: ["read:public_repo"],
          accountIdentifier: "alex-unconsented-test",
        },
      ]);
      dispatch({ type: "STOP_LOADING" });
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      if (err instanceof ApiError && err.status === 403) {
        setUnconsentedRefusedMessage("Nothing was read. Grant permission for each platform to continue.");
      } else {
        setUnconsentedRefusedMessage(`Guardrail responded with: ${err.message}`);
      }
    }
  };

  // Sync consented platforms
  const handleSyncFootprints = async () => {
    dispatch({ type: "START_LOADING", message: "Auditing consented external footprint..." });
    setActiveSyncMessage(null);

    try {
      const res = await apiClient.connectPlatforms(
        state.background.learnerId,
        state.consentEnvelopes
      );
      dispatch({ type: "SET_PLATFORM_FOOTPRINT", footprint: res.footprint });
      dispatch({ type: "SET_STAGED_CANDIDATES", candidates: res.footprint.stagedCandidates });
      dispatch({ type: "STOP_LOADING" });
      setActiveSyncMessage(`Discovered ${res.footprint.stagedCandidates.length} candidate skills from consented platforms.`);
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Platform discovery failed: ${err.message}`);
    }
  };

  const handleStartVerification = () => {
    // Collect user-confirmed staged candidates into claims
    const confirmed = state.stagedCandidates.filter((c) => c.userConfirmed);
    if (confirmed.length > 0) {
      dispatch({
        type: "SET_CLAIMS",
        claims: confirmed.map((c) => ({
          skillId: c.skillId,
          claimedLevel: c.impliedLevel,
          userConfirmed: true,
        })),
      });
    }
    dispatch({ type: "SET_ACTIVE_STAGE", stage: 3 });
  };

  return (
    <StageFrame
      stageNumber={2}
      title="Platform Connect & Consent Gate"
      subtitle="Explicitly grant or deny permission to analyze your technical footprints. Nothing is queried without your consent."
    >
      <div className="space-y-6">
        {/* Guardrail Demonstration Box */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--ink)]">
              Explicit Consent Guardrail Test
            </h2>
            <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
              Test server enforcement when permission is withheld.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unconsentedRefusedMessage && (
              <span className="text-[12px] text-[var(--vermilion)] font-medium font-serif-reading">
                {unconsentedRefusedMessage}
              </span>
            )}
            <button
              onClick={handleTestUnconsented}
              className="px-3 py-1.5 border border-[var(--vermilion)] text-[var(--vermilion)] bg-[var(--vermilion-tint)] hover:bg-[#F0D5D1] rounded-[4px] text-[12px] font-medium cursor-pointer"
            >
              Test unconsented request (consentGranted: false)
            </button>
          </div>
        </div>

        {/* Platform Authorization Table */}
        <div className="border border-[var(--rule)] bg-[var(--surface)]">
          <div className="p-4 border-b border-[var(--rule)] flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                Platform Permissions & Scopes
              </h2>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Audit scopes and configure handles for evidence triangulation.
              </p>
            </div>
            <button
              onClick={handleSyncFootprints}
              className="px-3 py-1.5 bg-[var(--ink)] text-[var(--surface)] hover:bg-[#323538] rounded-[4px] text-[12px] font-medium cursor-pointer"
            >
              Scan consented platforms
            </button>
          </div>

          <div className="divide-y divide-[var(--rule)] text-[13px]">
            {PLATFORMS.map((p) => {
              const env = getEnvelope(p.platform);
              const isConsented = env?.consentGranted ?? false;

              return (
                <div key={p.platform} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`consent-${p.platform}`}
                      checked={isConsented}
                      onChange={(e) => handleConsentToggle(p.platform, e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[var(--viridian)] border-[var(--rule)] rounded-[2px]"
                    />
                    <div>
                      <label htmlFor={`consent-${p.platform}`} className="font-semibold text-[var(--ink)] cursor-pointer">
                        {p.name}
                      </label>
                      <p className="text-[11px] text-[var(--pencil)] font-serif-reading">
                        {p.scopeDesc}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={env?.accountIdentifier || ""}
                      onChange={(e) => handleAccountChange(p.platform, e.target.value)}
                      placeholder={`${p.name} username / identifier`}
                      className="w-full px-2.5 py-1.5 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] text-[12px] rounded-[4px] font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 text-right">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[2px] ${
                        isConsented
                          ? "bg-[var(--viridian-tint)] text-[var(--viridian)] border border-[var(--viridian)]"
                          : "bg-[var(--surface-recessed)] text-[var(--pencil)] border border-[var(--rule)]"
                      }`}
                    >
                      {isConsented ? "Authorized" : "Not connected"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staged Discovered Candidates Table */}
        {state.stagedCandidates.length > 0 && (
          <div className="border border-[var(--rule)] bg-[var(--surface)]">
            <div className="p-4 border-b border-[var(--rule)]">
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                Staged Candidate Skills (User Confirmation Required)
              </h2>
              <p className="text-[12px] text-[var(--pencil)] font-serif-reading">
                Review discovered claims before queueing into diagnostic assessment.
              </p>
            </div>

            <div className="overflow-x-auto text-[12px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-recessed)] border-b border-[var(--rule)] text-[var(--ink)]">
                    <th className="p-3 w-12 text-center">Import</th>
                    <th className="p-3 font-medium">Skill</th>
                    <th className="p-3 font-medium">Origin</th>
                    <th className="p-3 font-medium">Implied Level</th>
                    <th className="p-3 font-medium">Empirical Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)] text-[var(--pencil)]">
                  {state.stagedCandidates.map((c) => (
                    <tr key={c.skillId} className={c.userConfirmed ? "bg-[var(--viridian-tint)]/40" : ""}>
                      <td className="p-3 text-center min-w-[44px]">
                        <input
                          type="checkbox"
                          checked={c.userConfirmed}
                          onChange={() => dispatch({ type: "TOGGLE_CANDIDATE_CONFIRMATION", skillId: c.skillId })}
                          className="w-4 h-4 text-[var(--viridian)] border-[var(--rule)] rounded-[2px] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-medium text-[var(--ink)]">{c.skillName}</td>
                      <td className="p-3 uppercase font-mono text-[11px]">{c.platformOrigin}</td>
                      <td className="p-3">
                        <select
                          value={c.impliedLevel}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_CANDIDATE_LEVEL",
                              skillId: c.skillId,
                              level: e.target.value as any,
                            })
                          }
                          className="px-2 py-1 border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] text-[12px] rounded-[2px]"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </td>
                      <td className="p-3 text-[11px] font-serif-reading text-[var(--ink)]">
                        {c.evidenceSource}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => dispatch({ type: "SET_ACTIVE_STAGE", stage: 1 })}
            className="px-4 py-2 border border-[var(--rule)] text-[var(--ink)] hover:bg-[var(--surface-recessed)] rounded-[4px] text-[13px] cursor-pointer"
          >
            Back to profile
          </button>

          <button
            onClick={handleStartVerification}
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer"
          >
            Start verification (Stage 3)
          </button>
        </div>
      </div>
    </StageFrame>
  );
}

