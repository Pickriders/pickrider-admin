/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { ChatParticipant, OrderChat, OrderMessage } from "@/lib/admin/api";

import { OrderChatPanel } from "./order-chat";
import { mayHaveChat, seenSeqs, tally, tallyLine, threadState, transcriptItems, transcriptText } from "./order-chat-lib";

let state: { data?: OrderChat; isLoading: boolean; isError: boolean; error?: unknown } = { isLoading: false, isError: false };
const useOrderMessages = jest.fn((..._args: unknown[]) => ({ ...state, refetch: jest.fn() }));
jest.mock("@/lib/admin/hooks", () => ({ useOrderMessages: (...args: unknown[]) => useOrderMessages(...args) }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, prefetch: _prefetch, ...rest }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const people: ChatParticipant[] = [
  { id: "c1", firstname: "Ada", lastname: "Obi", role: "CUSTOMER", phone: "2348011111111", current: true } as ChatParticipant,
  { id: "r1", firstname: "Bayo", lastname: "Old", role: "RIDER", phone: "2348022222222", current: false } as ChatParticipant,
  { id: "r2", firstname: "Chidi", lastname: "New", role: "RIDER", photo: "https://x/chidi.png", current: true } as ChatParticipant,
];

let seq = 0;
const msg = (patch: Partial<OrderMessage>): OrderMessage =>
  ({ id: `m${++seq}`, orderId: "o1", seq, kind: "TEXT", senderRole: "CUSTOMER", senderId: "c1", mine: false, body: "hi", createdAt: "2026-11-10T09:00:00.000Z", ...patch }) as OrderMessage;

function chat(): OrderChat {
  seq = 0;
  const messages = [
    msg({ kind: "SYSTEM" as OrderMessage["kind"], senderRole: "SYSTEM" as OrderMessage["senderRole"], senderId: undefined, body: "Bayo is on this order.", createdAt: "2026-11-10T08:59:00.000Z" }),
    msg({ body: "Where are you?" }),
    msg({ senderRole: "RIDER" as OrderMessage["senderRole"], senderId: "r1", body: "On my way", quickReplyKey: "ON_MY_WAY", createdAt: "2026-11-10T09:01:00.000Z" }),
    msg({ senderRole: "RIDER" as OrderMessage["senderRole"], senderId: "r2", body: "I'm outside", createdAt: "2026-11-11T10:00:00.000Z" }),
    msg({ body: "Coming down now", createdAt: "2026-11-11T10:01:00.000Z" }),
  ];
  return {
    thread: {
      orderId: "o1",
      orderNumber: "1042",
      eligible: true,
      open: false,
      readOnlyUntil: "2026-11-12T10:00:00.000Z",
      lastSeq: 5,
      customerLastReadSeq: 4,
      riderLastReadSeq: 2,
      lastMessageAt: "2026-11-11T10:01:00.000Z",
      participants: people,
    },
    messages,
    truncated: false,
  } as OrderChat;
}

describe("order chat rules", () => {
  it("only asks for a chat on live customer-app orders", () => {
    expect(mayHaveChat({})).toBe(true);
    expect(mayHaveChat({ livemode: true })).toBe(true);
    expect(mayHaveChat({ channel: "VENDOR_STOREFRONT" })).toBe(false);
    expect(mayHaveChat({ channel: "CUSTOMER_WEB" })).toBe(false);
    expect(mayHaveChat({ teamId: "t1" })).toBe(false);
    expect(mayHaveChat({ livemode: false })).toBe(false);
  });

  it("labels the thread open, read-only until a time, or closed", () => {
    const now = new Date("2026-11-11T12:00:00.000Z").getTime();
    expect(threadState({ open: true }, now)).toEqual({ label: "Open", tone: "success" });
    expect(threadState({ open: false, readOnlyUntil: "2026-11-12T10:00:00.000Z" }, now).label).toMatch(/^Read-only until /);
    expect(threadState({ open: false, readOnlyUntil: "2026-11-11T10:00:00.000Z" }, now)).toEqual({ label: "Closed", tone: "neutral" });
    expect(threadState({ open: false }, now).label).toBe("Closed");
  });

  it("counts who said what", () => {
    const counts = tally(chat().messages);
    expect(counts).toEqual({ total: 5, customer: 2, rider: 2, system: 1 });
    expect(tallyLine(counts)).toBe("5 messages: 2 from the customer, 2 from riders, 1 system");
    expect(tallyLine(tally([]))).toBe("0 messages");
  });

  it("marks the newest message each side has read, ignoring system lines", () => {
    const { messages, thread } = chat();
    // Rider read up to 2 (the customer's "Where are you?"), customer up to 4 (Chidi's "I'm outside").
    expect([...seenSeqs(messages, thread)].sort()).toEqual([2, 4]);
    expect(seenSeqs(messages, { customerLastReadSeq: 0, riderLastReadSeq: 0 }).size).toBe(0);
    expect(seenSeqs(messages, { customerLastReadSeq: 1, riderLastReadSeq: 1 }).size).toBe(0);
  });

  it("splits the transcript by day and starts a run when the sender changes", () => {
    const { messages, thread } = chat();
    const items = transcriptItems([...messages].reverse(), thread);
    expect(items.filter((item) => item.type === "day")).toHaveLength(2);
    const rows = items.flatMap((item) => (item.type === "message" ? [[item.message.seq, item.first, item.seen]] : []));
    expect(rows).toEqual([
      [1, true, false],
      [2, true, true],
      [3, true, false],
      [4, true, true],
      [5, true, false],
    ]);
  });

  it("copies a plain transcript with times and names", () => {
    const { messages, thread } = chat();
    const text = transcriptText(thread, messages, true);
    const lines = text.split("\n");
    expect(lines[0]).toBe("Order 1042 chat");
    expect(lines[1]).toBe("(the latest 1,000 messages)");
    expect(text).toMatch(/\d{1,2}:\d{2}(\s?[ap]m)?  Pickriders: Bayo is on this order\./i);
    expect(text).toContain("Ada Obi (customer): Where are you?");
    expect(text).toContain("Bayo Old (rider): On my way");
    expect(text).toContain("Chidi New (rider): I'm outside");
    expect(lines.filter((line) => /^\d{1,2} \w{3} \d{4}$/.test(line))).toHaveLength(2);
  });
});

describe("OrderChatPanel", () => {
  let container: HTMLDivElement;
  let root: Root;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    state = { isLoading: false, isError: false };
    // jsdom has no IntersectionObserver: the panel loads straight away.
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = (order: Parameters<typeof OrderChatPanel>[0]["order"] = { _id: "o1" }) => act(() => root.render(<OrderChatPanel order={order} />));

  it("never asks for a storefront order's chat", () => {
    render({ _id: "o1", channel: "VENDOR_STOREFRONT" });
    expect(container.innerHTML).toBe("");
    expect(useOrderMessages).toHaveBeenLastCalledWith("o1", false);
  });

  it("waits for the panel to near the viewport before loading", () => {
    const observe = jest.fn();
    let fire: (entries: { isIntersecting: boolean }[]) => void = () => undefined;
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest.fn((callback: typeof fire) => {
      fire = callback;
      return { observe, disconnect: jest.fn() };
    });
    render();
    expect(useOrderMessages).toHaveBeenLastCalledWith("o1", false);
    expect(observe).toHaveBeenCalled();
    state = { isLoading: true, isError: false };
    act(() => fire([{ isIntersecting: true }]));
    expect(useOrderMessages).toHaveBeenLastCalledWith("o1", true);
    expect(container.textContent).toContain("Messages");
  });

  it("hides when the order has no chat or no messages", () => {
    state = { isLoading: false, isError: false, data: { ...chat(), thread: { ...chat().thread, eligible: false } } };
    render();
    expect(container.innerHTML).toBe("");
    state = { isLoading: false, isError: false, data: { ...chat(), messages: [], thread: { ...chat().thread, lastSeq: 0 } } };
    render();
    expect(container.innerHTML).toBe("");
  });

  it("shows participants, bubbles on each side, system pills and seen markers", () => {
    state = { isLoading: false, isError: false, data: { ...chat(), truncated: true } };
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("5 messages: 2 from the customer, 2 from riders, 1 system");
    expect(text).toMatch(/Read-only until|Closed/);
    expect(text).toContain("Showing the latest 1,000 messages");
    expect(text).toContain("Earlier rider");
    expect(text).toContain("Current");
    expect(container.querySelector("a[href='tel:+2348011111111']")).not.toBeNull();
    expect(container.querySelector("a[href='/couriers/r2/details']")).not.toBeNull();
    expect(text.match(/Seen/g)).toHaveLength(2);
    expect(text).toContain("Bayo Old (earlier rider)");
    const outside = Array.from(container.querySelectorAll("li")).find((li) => li.textContent?.includes("I'm outside") && li.className.includes("flex-row-reverse"));
    expect(outside).toBeDefined();
    expect(container.querySelector("img[src='https://x/chidi.png']")).not.toBeNull();
  });

  it("shows an error with a retry", () => {
    state = { isLoading: false, isError: true, error: new Error("Order not found") };
    render();
    expect(container.textContent).toContain("Try again");
  });
});
