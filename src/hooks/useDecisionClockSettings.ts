"use client";

import { useEffect, useState } from "react";

export type DecisionClockSettings = {
  enabled: boolean;
  seconds: number;
};

const STORAGE_KEY = "poker_coach_decision_clock";
const DEFAULTS: DecisionClockSettings = { enabled: true, seconds: 15 };

function readFromStorage(): DecisionClockSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<DecisionClockSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULTS.enabled,
      seconds: parsed.seconds ?? DEFAULTS.seconds,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useDecisionClockSettings() {
  const [settings, setSettings] = useState<DecisionClockSettings>(DEFAULTS);

  useEffect(() => {
    setSettings(readFromStorage());
  }, []);

  function update(next: Partial<DecisionClockSettings>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // storage unavailable — ignore
    }
  }

  return { settings, update };
}
