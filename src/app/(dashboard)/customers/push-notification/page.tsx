import { redirect } from "next/navigation";

/** Bulk messaging moved to the Messaging page; old links land there with the audience preselected. */
export default function RedirectPage() {
  redirect("/messaging?audience=CUSTOMERS");
}
