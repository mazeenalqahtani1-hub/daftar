import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type RouterHistory } from "@tanstack/react-router";
import { useState } from "react";
import { createQueryClient } from "./query-client";
import { createAppRouter } from "./router";

export function App({ history }: { history?: RouterHistory }) {
  // One client + router per mounted app instance (also keeps tests isolated).
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(() => createAppRouter(queryClient, history));

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
