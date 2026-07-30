import { Info } from "lucide-react";

/**
 * The core API's notification trigger (POST /admins/notifications/trigger)
 * only sends a saved template to a single recipient — there is no audience or
 * broadcast endpoint yet, so these composers stay disabled with this notice.
 */
export const NotificationUnsupportedNote = () => (
  <div className="mb-6 flex items-start gap-x-3 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-4">
    <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
    <p className="text-xs font-montserrat text-amber-800 dark:text-amber-200">
      Broadcast sending isn&apos;t available yet — the core API only supports sending a saved template to one recipient
      at a time. This composer will go live once an audience-send endpoint ships on the backend.
    </p>
  </div>
);
