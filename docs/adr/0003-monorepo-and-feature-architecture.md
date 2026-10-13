# 0003 — Monorepo and feature-based architecture

**Status:** Accepted

## Decision

- pnpm workspaces + Turborepo: `apps/web`, `apps/api`, `apps/worker`, `packages/shared`, `packages/db`, `packages/config`.
- Workspace packages are consumed as TypeScript **source** (no per-package build step).
- Layering inside `apps/web`: `shared/` → `features/` → `app/` (imports only go downward).
  Features expose a single `index.ts`; other code may not reach into their internals.
- `apps/api` is organised in `modules/` with the same public-API rule; `infra/` and `middleware/` never import modules.
- Layering is enforced mechanically with **dependency-cruiser** in CI (`pnpm check:boundaries`).

## Consequences

- Large files and tangled imports are caught automatically.
- New capabilities are added as new folders without touching existing ones.
