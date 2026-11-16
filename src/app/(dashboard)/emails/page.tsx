import { Suspense } from "react";

import { EmailsHub } from "./_components/emails-hub";

export default function EmailsPage() {
  return (
    <Suspense>
      <EmailsHub />
    </Suspense>
  );
}
