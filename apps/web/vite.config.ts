import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/app/routes",
      generatedRouteTree: "./src/app/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    mode === "test"
      ? null
      : VitePWA({
          registerType: "autoUpdate",
          includeAssets: ["icon.svg"],
          manifest: {
            name: "دفتر",
            short_name: "دفتر",
            description: "دفتر الديون الرقمي الذي يربط المتاجر بالعملاء",
            lang: "ar",
            dir: "rtl",
            start_url: "/",
            scope: "/",
            display: "standalone",
            background_color: "#fcfcfa",
            theme_color: "#0d9488",
            icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
          },
          workbox: {
            // App shell only. Deliberately NO runtime caching: API responses
            // (balances, invoices, ledger) must never be served from a service-worker cache.
            globPatterns: ["**/*.{js,css,html,svg,woff2}"],
            navigateFallback: "/index.html",
            navigateFallbackDenylist: [/^\/api\//],
            cleanupOutdatedCaches: true,
          },
        }),
  ],
  build: { sourcemap: true, target: "es2023" },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
    env: {
      VITE_APP_ENV: "test",
      VITE_API_URL: "http://localhost:8787",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
}));
