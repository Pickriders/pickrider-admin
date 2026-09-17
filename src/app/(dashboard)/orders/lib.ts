import type { OrderRow, OrderStatus, OrderStop, OrderType } from "@/lib/admin/api";

/**
 * Small helpers shared by the orders list, board and detail pages. Everything
 * here is pure so the components stay about layout.
 */
export const ORDER_STATUSES: OrderStatus[] = ["INITIATED", "ACCEPTED", "ON_GOING", "COMPLETED", "CANCELLED"];
export const ORDER_TYPES: OrderType[] = ["SINGLE", "BATCH", "BULK"];

export const TYPE_LABEL: Record<OrderType, string> = {
  SINGLE: "Single",
  BATCH: "Batch delivery",
  BULK: "Bulk pickup",
};

export const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Payment pending",
  PAID: "Paid",
  FAILED: "Payment failed",
};

export const STOP_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_TRANSIT: "On the way",
  ARRIVED: "Arrived",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
};

export const BID_STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Won",
  PENDING: "Bidding",
  REJECTED: "Passed",
};

/** Minutes an INITIATED order can wait for a rider before the board flags it. */
export const STALE_AFTER_MINUTES = 15;

export function typeLabel(type: string | undefined) {
  return (type && TYPE_LABEL[type as OrderType]) || type || "";
}

export function paymentLabel(status: string | undefined) {
  return (status && PAYMENT_LABEL[status]) || status || "";
}

export function orderNumber(order: Pick<OrderRow, "orderNumber" | "_id">) {
  return order.orderNumber ? `#${order.orderNumber}` : `#${order._id.slice(-6).toUpperCase()}`;
}

export function minutesSince(value: string | Date | null | undefined) {
  if (!value) return 0;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, (Date.now() - then) / 60_000);
}

/** A scheduled order sits INITIATED (prepaid) until 30 min before its time; it is not waiting for a rider yet. */
export function isWaitingOnSchedule(order: Pick<OrderRow, "status" | "isScheduled" | "scheduleDispatchedAt">) {
  return order.status === "INITIATED" && Boolean(order.isScheduled) && !order.scheduleDispatchedAt;
}

export function isStale(order: Pick<OrderRow, "status" | "createdAt" | "isScheduled" | "scheduleDispatchedAt">) {
  if (isWaitingOnSchedule(order)) return false;
  // Once a scheduled order is dispatched the wait starts then, not when it was booked.
  const since = order.isScheduled && order.scheduleDispatchedAt ? order.scheduleDispatchedAt : order.createdAt;
  return order.status === "INITIATED" && minutesSince(since) > STALE_AFTER_MINUTES;
}

/** Pickups first, then drop-offs, so the list and the map read the same way. */
export function sortedStops(order: Pick<OrderRow, "locations"> | undefined): OrderStop[] {
  const stops = order?.locations ?? [];
  return [...stops].sort((a, b) => (a.type === "PICKUP" ? 0 : 1) - (b.type === "PICKUP" ? 0 : 1));
}

/** The API stores GeoJSON points as [lng, lat]. */
export function stopLatLng(stop: OrderStop): { lat: number; lng: number } | null {
  const coords = stop.position?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

export function totalDistanceKm(order: Pick<OrderRow, "locations"> | undefined) {
  return (order?.locations ?? []).reduce<number>((sum, stop) => sum + Number(stop.distanceTo ?? 0), 0);
}

export function stopContact(stop: OrderStop) {
  const pickup = stop.type === "PICKUP";
  return {
    name: pickup ? stop.senderName : stop.receiverName,
    phone: pickup ? stop.senderPhone : stop.receiverPhone,
  };
}

/** Every confirmation code a rider can be asked for at this stop. */
export function stopCodes(stop: OrderStop): { code: string; name?: string; status?: string }[] {
  if (stop.recipients?.length) {
    return stop.recipients
      .filter((recipient) => recipient.confirmationCode)
      .map((recipient) => ({ code: recipient.confirmationCode, name: recipient.name, status: recipient.status }));
  }
  return stop.confirmationCode ? [{ code: stop.confirmationCode }] : [];
}

/** The timestamp that explains the current status, for the status cell. */
export function statusAt(order: OrderRow): string | undefined {
  switch (order.status) {
    case "ACCEPTED":
      return order.acceptedAt;
    case "ON_GOING":
      return order.startedAt ?? order.acceptedAt;
    case "COMPLETED":
      return order.completedAt;
    case "CANCELLED":
      return order.cancelledAt;
    default:
      return order.createdAt;
  }
}

/**
 * Status overrides the admin may pick from each state. Each one runs the real side effects on the
 * API (starting stamps startedAt, completing settles the rider, un-assigning releases them), so
 * only steps the delivery could have taken are offered. Cancelling goes through the cancel action
 * (refunds), a completed order's money has already moved, and an order with no rider can't be
 * "accepted" by hand.
 */
export const STATUS_OVERRIDES: Record<OrderStatus, OrderStatus[]> = {
  INITIATED: [],
  ACCEPTED: ["ON_GOING", "INITIATED"],
  ON_GOING: ["COMPLETED", "ACCEPTED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const STATUS_OVERRIDE_HINT: Record<OrderStatus, string> = {
  INITIATED: "Send the order back to the queue: the rider is released and their offer withdrawn.",
  ACCEPTED: "Move back to accepted: the trip start time is cleared.",
  ON_GOING: "Mark in transit: needs a rider and a paid order; stamps the start time.",
  COMPLETED: "Mark completed: closes every open stop and pays the rider exactly as a normal completion.",
  CANCELLED: "",
};

export function phoneHref(phone: string | null | undefined) {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}

export function displayPhone(phone: string | null | undefined) {
  if (!phone) return "";
  return phone.startsWith("+") ? phone : `+${phone}`;
}
