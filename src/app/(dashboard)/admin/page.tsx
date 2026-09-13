import { Suspense } from "react";

import { AdminHub } from "./_components/admin-hub";

export default function AdminPage() {
  return (
    <Suspense>
      <AdminHub />
    </Suspense>
  );
}
