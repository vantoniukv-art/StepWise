const INTRO_SEEN_KEY = "stepwise_planner_intro_seen_v1";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "true";
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "true");
  } catch {
    // storage unavailable — the welcome block will just show again next visit
  }
}
