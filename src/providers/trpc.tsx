import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

// Lazy initialization to avoid TDZ errors
let _queryClient: QueryClient | null = null;
let _trpcClient: ReturnType<typeof trpc.createClient> | null = null;

function getQueryClient() {
  if (!_queryClient) {
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          retry: false,
        },
      },
    });
  }
  return _queryClient;
}

function getTrpcClient() {
  if (!_trpcClient) {
    _trpcClient = trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          fetch(input, init) {
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
      ],
    });
  }
  return _trpcClient;
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const trpcClient = getTrpcClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
