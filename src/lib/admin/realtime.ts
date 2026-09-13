"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { BASE_URL, STORAGE } from "@/constant";

/**
 * Live feed from the core orders gateway. Staff sockets are put in the
 * `admins` room on connect and receive `admin:order_updated` for every order
 * transition; the hook turns that into query invalidation so the tables and
 * tiles refresh without a reload. Polling (20s) stays on as the fallback.
 */
export type LiveState = { connected: boolean; lastEventAt: number | null; events: number };

let socket: Socket | null = null;
const listeners = new Set<(state: LiveState) => void>();
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
      }, 800);
    });
    return () => {
      listeners.delete(setLive);
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
