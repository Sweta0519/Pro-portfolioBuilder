/**
 * SyncController
 *
 * Centralized coordination for Supabase sync operations. Addresses the race
 * conditions flagged in Issue 5 of the architecture audit by providing:
 *
 *   1. Per-lane `AbortController`s so a stale write can be cancelled when the
 *      user signs out, switches accounts, or refreshes the page.
 *   2. A generation counter check. Every async sync captures the current
 *      generation at start; if the counter has changed by the time the sync
 *      resolves, the result is discarded.
 *   3. A `waitForIdle()` helper for the sign-out flow so it can flush or
 *      abort any in-flight write before tearing down the auth session.
 *
 * Why not use `supabase` directly: the audit's recommended fix was a
 * "transaction-based versioning scheme or a sync lock state variable". This
 * module implements both, without leaning on Supabase Realtime, RLS, or
 * server-side changes that we cannot safely roll out in a frontend-only
 * codebase.
 */

import { useAuthStore } from './stores/authStore';

export type SyncLane = 'login' | 'resumePush' | 'sessionPush';

interface LaneHandle {
  controller: AbortController;
  generation: number;
}

const lanes = new Map<SyncLane, LaneHandle>();

const FLUSH_TIMEOUT_MS = 3000;

const getGenerationNow = (): number => useAuthStore.getState().syncGeneration;

const isAnyLaneInFlight = (): boolean => {
  for (const handle of lanes.values()) {
    if (!handle.controller.signal.aborted) return true;
  }
  return false;
};

/**
 * Start a sync on a lane. Cancels any previous sync on the same lane, then
 * returns the captured generation so the caller can validate it at completion.
 */
export const startLane = (lane: SyncLane): { signal: AbortSignal; generation: number } => {
  const existing = lanes.get(lane);
  if (existing) existing.controller.abort();

  const controller = new AbortController();
  const generation = getGenerationNow();
  lanes.set(lane, { controller, generation });
  return { signal: controller.signal, generation };
};

/**
 * Mark a lane as completed. Returns `true` if the sync is still current
 * (its captured generation matches the live one), `false` if it has been
 * invalidated and the caller should discard the result.
 */
export const finishLane = (lane: SyncLane, capturedGeneration: number): boolean => {
  const handle = lanes.get(lane);
  if (!handle) return false;
  if (handle.generation !== capturedGeneration) {
    // A new sync on the same lane or a generation bump has replaced us.
    return false;
  }
  if (!handle.controller.signal.aborted) {
    handle.controller.abort();
  }
  lanes.delete(lane);
  return true;
};

/**
 * Manually abort a single lane. Useful when a useEffect tears down and the
 * cleanup runs before the lane has finished.
 */
export const abortLane = (lane: SyncLane): void => {
  const handle = lanes.get(lane);
  if (handle && !handle.controller.signal.aborted) {
    handle.controller.abort();
  }
  lanes.delete(lane);
};

/**
 * Abort every in-flight sync. Called on sign-out, user switch, and explicit
 * "abort and proceed" paths.
 */
export const abortAllLanes = (): void => {
  for (const handle of lanes.values()) {
    if (!handle.controller.signal.aborted) handle.controller.abort();
  }
  lanes.clear();
};

/**
 * Wait for every in-flight sync to either complete or abort. Times out
 * after `FLUSH_TIMEOUT_MS` and forces an abort. Returns `true` if the
 * flush succeeded within the timeout, `false` if it had to be aborted.
 */
export const waitForIdle = async (timeoutMs: number = FLUSH_TIMEOUT_MS): Promise<boolean> => {
  const deadline = Date.now() + timeoutMs;
  while (isAnyLaneInFlight() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (isAnyLaneInFlight()) {
    abortAllLanes();
    return false;
  }
  return true;
};

/**
 * Convenience helper: true when at least one sync is currently running. The
 * UI uses this to decide whether to show the "Syncing…" lock banner and to
 * gate the sign-out button.
 */
export const isSyncInFlight = (): boolean => isAnyLaneInFlight();
