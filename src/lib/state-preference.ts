import {
  ALL_STATES_NAME,
  ALL_STATES_SLUG,
  type StateOption,
} from "@/lib/institutions-types";

const STATE_PREF_KEY = "college-review-state-v2";

export interface SelectedState {
  name: string;
  slug: string;
}

export const ALL_STATES: SelectedState = {
  name: ALL_STATES_NAME,
  slug: ALL_STATES_SLUG,
};

export function getSelectedState(): SelectedState | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STATE_PREF_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SelectedState;
  } catch {
    return null;
  }
}

export function setSelectedState(state: SelectedState): void {
  sessionStorage.setItem(STATE_PREF_KEY, JSON.stringify(state));
}

export function resolveInitialState(
  states: StateOption[],
  saved: SelectedState | null
): SelectedState {
  if (saved?.slug === ALL_STATES_SLUG) {
    return ALL_STATES;
  }

  if (saved && states.some((s) => s.slug === saved.slug)) {
    return saved;
  }

  return ALL_STATES;
}
