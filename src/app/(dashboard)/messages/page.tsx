import { Suspense } from "react";

import { MessagesHub } from "./_components/messages-hub";

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesHub />
    </Suspense>
  );
}
