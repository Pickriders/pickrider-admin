import { Suspense } from "react";

import { MessagingHub } from "./_components/messaging-hub";

export default function MessagingPage() {
  return (
    <Suspense>
      <MessagingHub />
    </Suspense>
  );
}
