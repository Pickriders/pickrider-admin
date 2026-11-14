"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { BASE_URL, STORAGE } from "@/constant";
import type { AdminAlert } from "@/lib/admin/api";

/**
 * Live feed from the core orders gateway. Staff sockets are put in the
 * `admins` room on connect and receive `admin:order_updated` for every order
 * transition; the hook turns that into query invalidation so the tables and
 * tiles refresh without a reload. Polling (20s) stays on as the fallback.
 */
export type LiveState = { connected: boolean; lastEventAt: number | null; events: number };

/**
 * Staff alerts on the same connection: `admin:alert` when one opens, `admin:alert_updated` on
 * claim / resolve / repeat, and `admin:alert_digest` instead of a burst of `admin:alert` when more
 * than five of one type open within five minutes.
 */
export type AlertDigest = { type: string; count: number; sinceAt?: string };
export type AlertEvent =
  | { kind: "raised"; alert: AdminAlert }
  | { kind: "updated"; alert: AdminAlert }
  | { kind: "digest"; digest: AlertDigest };

let socket: Socket | null = null;
const listeners = new Set<(state: LiveState) => void>();
const alertListeners = new Set<(event: AlertEvent) => void>();

function emitAlert(event: AlertEvent) {
  emit({ lastEventAt: Date.now(), events: state.events + 1 });
  alertListeners.forEach((fn) => fn(event));
}
let state: LiveState = { connected: false, lastEventAt: null, events: 0 };

function emit(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

function ensureSocket(onOrder: (payload: unknown) => void) {
  if (socket) return socket;
  const token = getCookie(STORAGE.accessToken)?.toString();
  if (!token || !BASE_URL) return null;
  socket = io(`${BASE_URL}/orders`, {
    transports: ["websocket"],
    // The gateway verifies handshake.auth.token as a raw JWT.
    auth: { token },
    reconnectionDelayMax: 10_000,
  });
  socket.on("connect", () => emit({ connected: true }));
  socket.on("disconnect", () => emit({ connected: false }));
  socket.on("connect_error", () => emit({ connected: false }));
  socket.on("admin:order_updated", (payload) => {
    emit({ lastEventAt: Date.now(), events: state.events + 1 });
    onOrder(payload);
  });
  socket.on("admin:alert", (payload: { alert?: AdminAlert }) => {
    if (payload?.alert) emitAlert({ kind: "raised", alert: payload.alert });
  });
  socket.on("admin:alert_updated", (payload: { alert?: AdminAlert }) => {
    if (payload?.alert) emitAlert({ kind: "updated", alert: payload.alert });
  });
  socket.on("admin:alert_digest", (payload: AlertDigest) => {
    if (payload?.type) emitAlert({ kind: "digest", digest: payload });
  });
  return socket;
}

export function useAdminRealtime() {
  const client = useQueryClient();
  const [live, setLive] = useState<LiveState>(state);

  useEffect(() => {
    listeners.add(setLive);
    let timer: number | undefined;
    ensureSocket(() => {
      // Coalesce bursts: one refresh per 800ms no matter how many events land.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void client.invalidateQueries({ queryKey: ["orders"] });
        void client.invalidateQueries({ queryKey: ["order"] });
        void client.invalidateQueries({ queryKey: ["stats"] });
        void client.invalidateQueries({ queryKey: ["handoffs"] });
      }, 800);
    });
    return () => {
      listeners.delete(setLive);
      window.clearTimeout(timer);
    };
  }, [client]);

  return live;
}

/**
 * Listen to staff alerts on the live socket. Every alert event also refreshes the alert and
 * handoff queries (coalesced), so lists and the bell stay current without their own polling
 * doing the work. Returns the live state so callers can say when they are polling instead.
 */
export function useAdminAlertEvents(handler?: (event: AlertEvent) => void) {
  const client = useQueryClient();
  const live = useAdminRealtime();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    let timer: number | undefined;
    const listener = (event: AlertEvent) => {
      ref.current?.(event);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void client.invalidateQueries({ queryKey: ["alerts"] });
        void client.invalidateQueries({ queryKey: ["handoffs"] });
      }, 400);
    };
    alertListeners.add(listener);
    return () => {
      alertListeners.delete(listener);
      window.clearTimeout(timer);
    };
  }, [client]);

  return live;
}

export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
  emit({ connected: false });
}
