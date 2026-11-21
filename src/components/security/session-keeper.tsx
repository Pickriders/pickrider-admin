"use client";

import { useEffect } from "react";

import { startSessionKeeper } from "@/services";

/**
 * Keeps the admin session fresh while the console is open: refreshes the access token about a
 * minute before it expires (one tab at a time), rechecks when the tab comes back into view, and
 * follows refreshes and sign-outs from the other tabs. Renders nothing.
 */
export function SessionKeeper() {
  useEffect(() => startSessionKeeper(), []);
  return null;
}
