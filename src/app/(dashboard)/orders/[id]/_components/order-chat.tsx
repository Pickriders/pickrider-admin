"use client";

import { CheckCheck, Copy, MessagesSquare, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, Badge, Button, EmptyState, ErrorState, Panel, PanelHeader, Skeleton, cx } from "@/components/kit";
import type { ChatParticipant, OrderChat, OrderMessage } from "@/lib/admin/api";
import { ago, fullName, time, when } from "@/lib/admin/format";
import { useOrderMessages } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { displayPhone, phoneHref } from "../../lib";
import { type ChatOrder, mayHaveChat, participantFor, senderName, tally, tallyLine, threadState, transcriptItems, transcriptText } from "./order-chat-lib";

/**
 * The rider and customer chat on the order, read-only for staff. Loads once the panel nears the
 * viewport (or the URL asks for #messages), and only shows when the order has a chat with at
 * least one message in it.
 */
function useNearViewport(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!enabled || near) return;
    if (typeof window !== "undefined" && window.location.hash === "#messages") {
      setNear(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setNear(true);
    }, { rootMargin: "300px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, near]);
  return { ref, near };
}

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-3/5 rounded-2xl" />
        <Skeleton className="ml-auto h-9 w-1/2 rounded-2xl" />
        <Skeleton className="mx-auto h-5 w-40 rounded-full" />
        <Skeleton className="h-9 w-2/5 rounded-2xl" />
      </div>
    </div>
  );
}

function Participants({ people }: { people: ChatParticipant[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {people.map((person) => {
        const name = fullName(person) || (person.role === "CUSTOMER" ? "Customer" : "Rider");
        const href = person.role === "CUSTOMER" ? `/customers/${person.id}` : `/couriers/${person.id}/details`;
        return (
          <li key={`${person.role}-${person.id}`} className={cx("flex min-w-0 max-w-full items-center gap-2 rounded-xl border px-2.5 py-1.5", person.current ? "border-line-strong bg-card" : "border-line bg-surface/60")}>
            <Avatar src={person.photo} name={name} size={28} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1.5 text-xs">
                <Link href={href} className="truncate font-semibold text-ink hover:underline">
                  {name}
                </Link>
                <span className="text-ink-faint">{person.role === "CUSTOMER" ? "Customer" : person.current ? "Rider" : "Earlier rider"}</span>
                {person.role === "RIDER" && person.current ? (
                  <Badge tone="brand" dot>
                    Current
                  </Badge>
                ) : null}
              </p>
              {person.phone ? (
                <a href={phoneHref(person.phone)} className="inline-flex items-center gap-1 text-[11px] tabular-nums text-ink-muted hover:text-ink hover:underline">
                  <Phone size={10} aria-hidden />
                  {displayPhone(person.phone)}
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SystemLine({ message }: { message: OrderMessage }) {
  return (
    <li className="flex justify-center py-1">
      <span className="max-w-[85%] rounded-full bg-surface px-3 py-1 text-center text-[11px] text-ink-muted ring-1 ring-line">
        {message.body}
        <time dateTime={message.createdAt} title={when(message.createdAt)} className="ml-1.5 tabular-nums text-ink-faint">
          {time(message.createdAt)}
        </time>
      </span>
    </li>
  );
}

function Bubble({ message, first, seen, people }: { message: OrderMessage; first: boolean; seen: boolean; people: ChatParticipant[] }) {
  const rider = message.senderRole === "RIDER";
  const person = participantFor(message, people);
  const name = senderName(message, people);
  return (
    <li className={cx("flex items-end gap-2", rider ? "flex-row-reverse" : "flex-row", first ? "pt-2" : "pt-0.5")}>
      {rider ? <span className="w-7 shrink-0">{first ? <Avatar src={person?.photo} name={name} size={28} /> : null}</span> : null}
      <div className={cx("flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]", rider ? "items-end" : "items-start")}>
        {first ? <p className="mb-0.5 px-1 text-[11px] font-semibold text-ink-muted">{rider && person && !person.current ? `${name} (earlier rider)` : name}</p> : null}
        <div
          className={cx(
            "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-snug",
            rider ? "rounded-br-md bg-brand-soft text-ink" : "rounded-bl-md border border-line bg-surface text-ink",
          )}
        >
          {message.body}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 px-1 text-[10px] text-ink-faint">
          <time dateTime={message.createdAt} title={when(message.createdAt)} className="tabular-nums">
            {time(message.createdAt)}
          </time>
          {message.quickReplyKey ? <span>· quick reply</span> : null}
          {seen ? (
            <span className="inline-flex items-center gap-0.5 font-semibold text-info">
              <CheckCheck size={11} aria-hidden />
              Seen
            </span>
          ) : null}
        </p>
      </div>
    </li>
  );
}

function Transcript({ data }: { data: OrderChat }) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const items = transcriptItems(data.messages, data.thread);
  const last = data.messages[data.messages.length - 1]?.seq;

  // Open at the newest message, like a chat.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [last]);

  return (
    <div ref={scroller} className="max-h-[32rem] overflow-y-auto rounded-2xl border border-line bg-card px-3 py-2 sm:px-4">
      {data.truncated ? <p className="py-1 text-center text-[11px] text-ink-faint">Showing the latest 1,000 messages</p> : null}
      <ol aria-label="Messages">
        {items.map((item) =>
          item.type === "day" ? (
            <li key={item.key} className="flex items-center gap-3 py-2 text-[11px] font-semibold text-ink-faint">
              <span aria-hidden className="h-px flex-1 bg-line" />
              {item.label}
              <span aria-hidden className="h-px flex-1 bg-line" />
            </li>
          ) : item.message.senderRole === "SYSTEM" ? (
            <SystemLine key={item.key} message={item.message} />
          ) : (
            <Bubble key={item.key} message={item.message} first={item.first} seen={item.seen} people={data.thread.participants} />
          ),
        )}
      </ol>
    </div>
  );
}

export function OrderChatPanel({ order }: { order: ChatOrder }) {
  const possible = mayHaveChat(order);
  const { ref, near } = useNearViewport(possible);
  const query = useOrderMessages(order._id, possible && near);
  const data = query.data;

  useEffect(() => {
    if (data && window.location.hash === "#messages") document.getElementById("messages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data]);

  if (!possible) return null;
  // Not loaded yet: a marker for the observer, nothing on screen.
  if (!near) return <div ref={ref} aria-hidden className="h-px" />;
  if (data && (!data.thread.eligible || (!data.messages.length && !data.thread.lastSeq))) return null;

  const counts = tally(data?.messages ?? []);
  const state = data ? threadState(data.thread) : null;
  const copy = () => {
    if (!data) return;
    const text = transcriptText(data.thread, data.messages, data.truncated);
    if (!navigator.clipboard?.writeText) {
      toast.error("Copying is not available in this browser.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success("Transcript copied"),
      () => toast.error("Could not copy the transcript."),
    );
  };

  return (
    <Panel id="messages" className="scroll-mt-24">
      <PanelHeader
        title="Messages"
        subtitle={
          data ? (
            <>
              {tallyLine(counts)}
              {data.thread.lastMessageAt ? `. Last ${ago(data.thread.lastMessageAt)}` : ""}
            </>
          ) : (
            "Chat between the rider and the customer"
          )
        }
        action={
          data && state ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge tone={state.tone} dot={data.thread.open}>
                {state.label}
              </Badge>
              {data.messages.length ? (
                <Button size="sm" variant="outline" icon={Copy} onClick={copy} aria-label="Copy transcript">
                  <span className="hidden sm:inline">Copy transcript</span>
                </Button>
              ) : null}
            </div>
          ) : null
        }
      />
      <div className="space-y-3 px-4 pb-5 pt-4 sm:px-5">
        {query.isLoading ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : data ? (
          <>
            <Participants people={data.thread.participants} />
            {data.messages.length ? (
              <Transcript data={data} />
            ) : (
              <EmptyState compact icon={MessagesSquare} title="No messages to show" description="The chat has history, but none of it came back. Try again in a moment." />
            )}
            <p className="text-[11px] text-ink-faint">Read-only. Staff cannot send or mark messages as read here.</p>
          </>
        ) : null}
      </div>
    </Panel>
  );
}
