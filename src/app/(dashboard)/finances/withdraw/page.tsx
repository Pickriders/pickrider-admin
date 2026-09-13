import { redirect } from "next/navigation";

/** Withdrawing from the platform wallet is the Payout tab now. */
export default function WithdrawPage() {
  redirect("/finances?tab=payout");
}
