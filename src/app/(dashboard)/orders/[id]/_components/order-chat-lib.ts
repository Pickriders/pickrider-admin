import type { Tone } from "@/components/kit";
import type { ChatParticipant, OrderChatThread, OrderMessage } from "@/lib/admin/api";
import { count, day, fullName, orderSource, time, when } from "@/lib/admin/format";

/**
 * Pure rules behind the order chat panel: who said what, where the day changes, which messages
 * the other side has seen, the thread state chip and the plain-text transcript staff copy.
 */

/** Where the order came from: channel for storefront and web orders, teamId and livemode for the Developer API. */
export type ChatOrder = { _id: string; channel?: string | null; teamId?: string | null; livemode?: boolean | null };

/** The core only opens a chat on live customer-app orders, so skip the request for the rest. */
export function mayHaveChat(order: Omit<ChatOrder, "_id">) {
  return orderSource(order.channel) === "APP" && !order.teamId && order.livemode !== false;
}

export function threadState(thread: Pick<OrderChatThread, "open" | "readOnlyUntil">, now = Date.now()): { label: string; tone: Tone } {
  if (thread.open) return { label: "Open", tone: "success" };
  if (thread.readOnlyUntil && new Date(thread.readOnlyUntil).getTime() > now) return { label: `Read-only until ${when(thread.readOnlyUntil)}`, tone: "warning" };
  return { label: "Closed", tone: "neutral" };
}

export type Tally = { total: number; customer: number; rider: number; system: number };

export function tally(messages: Pick<OrderMessage, "senderRole">[]): Tally {
  const out: Tally = { total: messages.length, customer: 0, rider: 0, system: 0 };
  for (const message of messages) {
    if (message.senderRole === "CUSTOMER") out.customer += 1;
    else if (message.senderRole === "RIDER") out.rider += 1;
    else out.system += 1;
  }
  return out;
}

export function tallyLine(counts: Tally) {
  const parts = [`${count(counts.total)} message${counts.total === 1 ? "" : "s"}`];
  const detail = [
    counts.customer ? `${count(counts.customer)} from the customer` : "",
    counts.rider ? `${count(counts.rider)} from riders` : "",
    counts.system ? `${count(counts.system)} system` : "",
  ].filter(Boolean);
  return detail.length ? `${parts[0]}: ${detail.join(", ")}` : parts[0];
}

export function participantFor(message: Pick<OrderMessage, "senderId" | "senderRole">, participants: ChatParticipant[]) {
  if (message.senderRole === "SYSTEM") return undefined;
  return participants.find((person) => person.id === message.senderId) ?? (message.senderRole === "CUSTOMER" ? participants.find((person) => person.role === "CUSTOMER") : undefined);
}

export function senderName(message: Pick<OrderMessage, "senderId" | "senderRole">, participants: ChatParticipant[]) {
  if (message.senderRole === "SYSTEM") return "Pickriders";
  const person = participantFor(message, participants);
  return fullName(person) || (message.senderRole === "CUSTOMER" ? "Customer" : "Rider");
}

/**
 * The newest message from each side the other side has read up to: the customer's read marker
 * says which rider messages were seen, the rider's marker which customer messages were.
 */
export function seenSeqs(messages: Pick<OrderMessage, "seq" | "senderRole" | "kind">[], thread: Pick<OrderChatThread, "customerLastReadSeq" | "riderLastReadSeq">) {
  let customer = 0;
  let rider = 0;
  for (const message of messages) {
    if (message.kind !== "TEXT") continue;
    if (message.senderRole === "CUSTOMER" && message.seq <= thread.riderLastReadSeq) customer = Math.max(customer, message.seq);
    if (message.senderRole === "RIDER" && message.seq <= thread.customerLastReadSeq) rider = Math.max(rider, message.seq);
  }
  return new Set([customer, rider].filter(Boolean));
}

export type TranscriptItem =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: OrderMessage; first: boolean; seen: boolean };

/**
 * Messages in seq order with a day line wherever the Lagos date changes. `first` marks the start of
 * a run from one sender, where the bubble shows the name (and the rider's photo).
 */
export function transcriptItems(messages: OrderMessage[], thread: Pick<OrderChatThread, "customerLastReadSeq" | "riderLastReadSeq">): TranscriptItem[] {
  const ordered = [...messages].sort((a, b) => a.seq - b.seq);
  const seen = seenSeqs(ordered, thread);
  const out: TranscriptItem[] = [];
  let lastDay = "";
  let lastSender = "";
  for (const message of ordered) {
    const label = day(message.createdAt);
    if (label && label !== lastDay) {
      out.push({ type: "day", key: `day-${label}`, label });
      lastDay = label;
      lastSender = "";
    }
    const sender = message.senderRole === "SYSTEM" ? "SYSTEM" : `${message.senderRole}:${message.senderId ?? ""}`;
    out.push({ type: "message", key: message.id, message, first: sender !== lastSender, seen: seen.has(message.seq) });
    lastSender = sender;
  }
  return out;
}

/** Plain text for the clipboard: a header, then one line per message with the time and who said it. */
export function transcriptText(thread: Pick<OrderChatThread, "orderNumber" | "participants">, messages: OrderMessage[], truncated = false) {
  const lines = [`Order ${thread.orderNumber} chat`];
  if (truncated) lines.push("(the latest 1,000 messages)");
  let lastDay = "";
  for (const message of [...messages].sort((a, b) => a.seq - b.seq)) {
    const label = day(message.createdAt);
    if (label && label !== lastDay) {
      lines.push("", label);
      lastDay = label;
    }
    const who =
      message.senderRole === "SYSTEM" ? "Pickriders" : `${senderName(message, thread.participants)} (${message.senderRole === "CUSTOMER" ? "customer" : "rider"})`;
    lines.push(`${time(message.createdAt)}  ${who}: ${message.body}`);
  }
  return lines.join("\n");
}
