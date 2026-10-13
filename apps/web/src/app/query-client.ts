import { QueryClient } from "@tanstack/react-query";

/**
 * Server state lives in TanStack Query's IN-MEMORY cache only.
 * Never add a persister (localStorage/IndexedDB) for balances, invoices or ledger data.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
      mutations: { retry: 0 },
    },
  });
}
