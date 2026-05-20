"use client";

import { useState, useCallback } from "react";

export type SolverStatus = "idle" | "loading" | "solving" | "done" | "error" | "unavailable";

export type SolverResult = {
  /** EV in big blinds */
  ev: number;
  /** Strategy frequencies keyed by action */
  strategy: Record<string, number>;
  /** Node equity */
  equity: number;
};

export type SolverState = {
  status: SolverStatus;
  result: SolverResult | null;
  error: string | null;
};

/**
 * Hook for the WASM Postflop solver.
 *
 * Phase 7 stub: the solver is not yet integrated (requires wasm-postflop package).
 * The hook exposes the full interface so the UI can be built and tested.
 * When wasm-postflop is installed, replace the solve() body with the real implementation.
 */
export function useSolver() {
  const [state, setState] = useState<SolverState>({
    status: "idle",
    result: null,
    error: null,
  });

  const solve = useCallback(
    async (_params: {
      heroCards: string[];
      villainRange: string;
      board: string[];
      pot: number;
      effectiveStack: number;
    }) => {
      setState({ status: "loading", result: null, error: null });

      // TODO: replace with wasm-postflop integration
      // import { Solver } from "wasm-postflop";
      // const solver = new Solver();
      // solver.buildTree(...)
      // await solver.solve()
      // const result = solver.getResult()

      // Stub: mark as unavailable until package is installed
      setState({
        status: "unavailable",
        result: null,
        error: "Real-time solver requires wasm-postflop (Phase 7 — install to activate).",
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle", result: null, error: null });
  }, []);

  return { state, solve, reset };
}
