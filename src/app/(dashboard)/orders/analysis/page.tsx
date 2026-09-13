import { redirect } from "next/navigation";

/** The analysis now lives on a tab of the orders page. */
export default function OrderAnalysisRedirect() {
  redirect("/orders?tab=analysis");
}
