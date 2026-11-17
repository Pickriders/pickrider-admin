import type { ErasureBlocker, User } from "@/lib/admin/api";
import { naira, count } from "@/lib/admin/format";

/**
 * The erasure checklist: every blocker the core knows about, shown as a line that is either
 * clear or in the way, so the admin sees what to resolve before the account can go.
 */
export const ERASURE_CHECKS: { code: string; label: string }[] = [
  { code: "OPEN_ORDERS", label: "No open orders" },
  { code: "RIDER_MID_TRIP", label: "Not on a delivery" },
  { code: "WALLET_BALANCE", label: "Wallet balance is zero" },
  { code: "PENDING_WITHDRAWALS", label: "No withdrawals in progress" },
  { code: "OWNS_BUSINESS", label: "Does not own a business" },
  { code: "OWNS_TEAM", label: "Does not own a team" },
];

export type ErasureCheck = { code: string; label: string; ok: boolean; detail?: string };

/** One line per known check plus any blocker code the console does not know yet, so nothing the API says is lost. */
export function erasureChecklist(blockers: ErasureBlocker[] | undefined): ErasureCheck[] {
  const byCode = new Map((blockers ?? []).map((b) => [b.code, b]));
  const known = ERASURE_CHECKS.map(({ code, label }) => {
    const blocker = byCode.get(code);
    if (!blocker) return { code, label, ok: true };
    return { code, label, ok: false, detail: blockerDetail(blocker) };
  });
  const unknown = (blockers ?? [])
    .filter((b) => !ERASURE_CHECKS.some((c) => c.code === b.code))
    .map((b) => ({ code: b.code, label: b.message || b.code, ok: false, detail: blockerDetail(b) }));
  return [...known, ...unknown];
}

/** The API's sentence, with the amount in naira for the balance (count is in sub-units there). */
export function blockerDetail(blocker: ErasureBlocker): string {
  if (blocker.code === "WALLET_BALANCE") return blocker.message || `${naira(blocker.count, 2)} still in the wallet`;
  if (blocker.message) return blocker.message;
  return `${count(blocker.count)} in the way`;
}

/** What the admin must type to confirm: the phone or the email, whichever the account has (phone first). */
export function erasureConfirmTarget(user: Pick<User, "phone" | "email">): { label: string; value: string } | null {
  if (user.phone) return { label: "phone number", value: user.phone };
  if (user.email) return { label: "email address", value: user.email };
  return null;
}

/** Loose match: digits only for phones, case-insensitive for emails, so "+234 803..." and "0803..." both pass for a 234803... record. */
export function erasureConfirmMatches(typed: string, target: { label: string; value: string } | null): boolean {
  if (!target) return false;
  if (target.label === "phone number") {
    const a = typed.replace(/\D/g, "");
    const b = target.value.replace(/\D/g, "");
    if (!a || !b) return false;
    return (
      a === b || (a.startsWith("0") && a.length === 11 && b.endsWith(a.slice(1))) || (a.length >= 10 && b.endsWith(a))
    );
  }
  return typed.trim().toLowerCase() === target.value.trim().toLowerCase();
}
