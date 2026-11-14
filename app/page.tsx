"use client";

import React from "react";
import { SkillPathProvider, useSkillPath } from "@/lib/store/skillpath-store";
import { PresenterStrip } from "@/components/shell/PresenterStrip";
import { JourneyRail } from "@/components/shell/JourneyRail";
import { EvidencePanel } from "@/components/shell/EvidencePanel";
import { LandingOverview } from "@/components/stages/LandingOverview";
import { ProfileStage } from "@/components/stages/ProfileStage";
import { ConnectStage } from "@/components/stages/ConnectStage";
import { VerifyStage } from "@/components/stages/VerifyStage";
import { ValidatedStage } from "@/components/stages/ValidatedStage";
import { RoadmapStage } from "@/components/stages/RoadmapStage";
import { MentorStage } from "@/components/stages/MentorStage";
import { SwitchStage } from "@/components/stages/SwitchStage";

function StageContainer() {
  const { state } = useSkillPath();

  switch (state.activeStage) {
    case 0:
      return <LandingOverview />;
    case 1:
      return <ProfileStage />;
    case 2:
      return <ConnectStage />;
    case 3:
      return <VerifyStage />;
    case 4:
      return <ValidatedStage />;
    case 5:
      return <RoadmapStage />;
    case 6:
      return <MentorStage />;
    case 7:
      return <SwitchStage />;
    default:
      return <LandingOverview />;
  }
}

export default function Home() {
  return (
    <SkillPathProvider>
      <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] antialiased select-text">
        <PresenterStrip />
        <div className="flex-1 flex flex-col md:flex-row min-h-0 border-t border-[var(--rule)]">
          <JourneyRail />
          <main className="flex-1 overflow-y-auto">
            <StageContainer />
          </main>
          <EvidencePanel />
        </div>
      </div>
    </SkillPathProvider>
  );
}
