import { redirect } from "next/navigation";

/** Payouts moved into the Finances page as a tab. */
export default function InitiatePayoutPage() {
  redirect("/finances?tab=payout");
}
