import { QueryClient } from "@tanstack/react-query";

/**
 * Fresh for 30 seconds, then refetched on the next mount. `staleTime: Infinity`
 * used to mean nothing ever refreshed after a mutation unless a caller
 * remembered to invalidate the exact key. Focus refetches stay off so tabbing
 * back does not fire a storm of requests.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
