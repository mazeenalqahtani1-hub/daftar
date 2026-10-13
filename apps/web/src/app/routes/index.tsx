import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

/** Phase 0 shell: proves routing, styling and the PWA pipeline. No product features yet. */
function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-brand text-4xl font-extrabold">دفتر</h1>
      <p className="text-sm opacity-70">المشروع قيد التأسيس</p>
    </main>
  );
}
