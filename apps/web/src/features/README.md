# Features

Empty in Phase 0. One folder per product capability (auth, pos, customer, merchant, catalog, staff, notifications...):

```
features/<name>/
  components/   # feature-specific UI
  hooks/        # TanStack Query hooks, UI state
  api/          # calls to apps/api through shared/api-client
  model/        # types, view-model helpers (NO financial math)
  index.ts      # the ONLY entry point other code may import
```

Rules (enforced by dependency-cruiser):

- A feature never imports another feature's internals, only its `index.ts`.
- `shared/` never imports `features/` or `app/`.
- Features never import `app/`.
- Financial truth comes from the server. The UI may show an _estimated_ total while building a cart,
  but the database is the final authority on prices, VAT and totals.
- No localStorage/IndexedDB for money, debts or balances. Zustand is allowed for in-memory
  cashier-session state (cart, UI) only.
