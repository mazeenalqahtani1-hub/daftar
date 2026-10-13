import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Internal workspace packages ship as TypeScript source: bundle them in.
  // Bundled CommonJS deps (pino) need a `require` in an ESM output.
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  noExternal: [/^@daftar\//],
});
