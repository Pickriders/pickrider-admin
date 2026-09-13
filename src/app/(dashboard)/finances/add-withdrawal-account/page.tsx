import { redirect } from "next/navigation";

/** The settlement account now lives on the Finances overview. */
export default function AddWithdrawalAccountPage() {
  redirect("/finances?tab=overview");
}
