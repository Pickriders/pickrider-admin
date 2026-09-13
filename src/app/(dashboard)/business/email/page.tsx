import { redirect } from "next/navigation";

/** Emailing businesses happens on the messaging page with the audience preselected. */
export default function BusinessEmailPage() {
  redirect("/messaging?audience=BUSINESSES");
}
