import type { StepUpDetails } from "./auth-errors";

/**
 * The bridge between the API client and the step-up dialog. A request that comes back 428
 * MFA_STEP_UP_REQUIRED calls `requestStepUp(details)` and waits; the dialog (mounted once in the
 * dashboard shell) subscribes, asks the admin for an authenticator code and settles the promise.
 * Several requests failing together share one prompt: the code they get back is sent with each
 * retry, and the core accepts a TOTP step only once, so only the first retry should rely on it.
 * To keep that simple every waiter gets the same code and the dialog asks again when a retry
 * comes back 428 a second time.
 */
export type StepUpRequest = {
  details: StepUpDetails;
  /** What the code is for, when the caller knows (shown in the dialog). */
  purpose?: string;
};

type Listener = (request: StepUpRequest | null) => void;

type Waiter = { resolve: (code: string | null) => void };

let current: StepUpRequest | null = null;
let waiters: Waiter[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(current);
}

/** Asks for a fresh code. Resolves with the code, or null when the admin cancelled. */
export function requestStepUp(details: StepUpDetails, purpose?: string): Promise<string | null> {
  return new Promise((resolve) => {
    waiters.push({ resolve });
    if (!current) {
      current = { details, purpose };
      emit();
    } else if (purpose && !current.purpose) {
      current = { ...current, purpose };
      emit();
    }
  });
}

/** The dialog calls this with the code the admin typed, or null when they cancelled. */
export function settleStepUp(code: string | null) {
  const pending = waiters;
  waiters = [];
  current = null;
  emit();
  for (const waiter of pending) waiter.resolve(code);
}

export function subscribeStepUp(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

export function currentStepUp() {
  return current;
}

/** Test helper: drops any pending prompt without resolving its waiters. */
export function resetStepUpForTests() {
  current = null;
  waiters = [];
  listeners.clear();
}
