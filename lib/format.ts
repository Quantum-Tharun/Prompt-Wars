export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatHours(hours: number): string {
  if (hours <= 0) return "0 hrs";
  return `${Math.round(hours)} hrs`;
}

export function formatWeeks(weeks: number): string {
  return `${Math.max(1, Math.round(weeks))} wks`;
}

export function formatCognitiveTier(tier: string): string {
  switch (tier) {
    case "syntax_recall":
    case "declarative_concept":
      return "Declarative concept";
    case "code_tracing":
      return "Code tracing";
    case "scenario_debugging":
      return "Scenario debugging";
    default:
      return tier.replace(/_/g, " ");
  }
}

export function formatProficiency(level: string): string {
  switch (level.toLowerCase()) {
    case "none":
      return "None";
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return level;
  }
}

export function formatCalibrationDelta(delta: number): string {
  if (delta < 0) {
    const abs = Math.abs(delta);
    return `Verified ${abs} level${abs > 1 ? "s" : ""} below claimed`;
  }
  if (delta > 0) {
    return `Verified ${delta} level${delta > 1 ? "s" : ""} above claimed`;
  }
  return "Matches claimed level";
}

export function formatArchetype(archetype: string): string {
  switch (archetype) {
    case "verified_practitioner":
      return "Verified practitioner";
    case "certificate_collector":
      return "Certificate collector";
    case "tutorial_cloner":
      return "Tutorial cloner";
    case "portfolio_starved_theorist":
      return "Portfolio-starved theorist";
    case "hidden_practitioner":
      return "Hidden practitioner";
    case "overconfident_novice":
      return "Overconfident novice";
    case "calibrated_learner":
      return "Calibrated learner";
    case "unverified_claim":
      return "Unverified claim";
    default:
      return archetype.replace(/_/g, " ");
  }
}

export function formatElapsedSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatCareerTitle(careerId: string): string {
  switch (careerId) {
    case "fullstack_dev":
      return "Full Stack Developer";
    case "data_analyst":
      return "Data Analyst";
    case "aiml_engineer":
      return "AI/ML Engineer";
    default:
      return careerId.replace(/_/g, " ");
  }
}

