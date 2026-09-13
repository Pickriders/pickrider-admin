import { redirect } from "next/navigation";

/** Push to businesses happens on the messaging page with the audience preselected. */
export default function BusinessPushNotificationPage() {
  redirect("/messaging?audience=BUSINESSES");
}
