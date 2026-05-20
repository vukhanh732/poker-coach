"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "poker_coach_high_contrast";
const CLASS_NAME = "high-contrast";

export function useHighContrast() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === "1";
      setEnabled(stored);
      if (stored) document.documentElement.classList.add(CLASS_NAME);
    } catch { /* ignore */ }
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      if (next) {
        document.documentElement.classList.add(CLASS_NAME);
      } else {
        document.documentElement.classList.remove(CLASS_NAME);
      }
    } catch { /* ignore */ }
  }

  return { enabled, toggle };
}
