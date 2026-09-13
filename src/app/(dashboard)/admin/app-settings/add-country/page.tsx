import { redirect } from "next/navigation";

/** Moved into the admin hub; the form opens in a drawer. */
export default function AddCountryPage() {
  redirect("/admin?tab=settings&add=country");
}
