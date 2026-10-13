# API modules

Empty in Phase 0. Each business capability lives in its own folder:

```
modules/<name>/
  routes.ts    # Hono routes: parse input (Zod) -> call service
  service.ts   # authorization + call to a PostgreSQL api.* function
  schemas.ts   # Zod request/response schemas
  index.ts     # the ONLY file other modules may import
```

Rules (enforced by dependency-cruiser):

- Modules never import each other's internals, only `index.ts`.
- `infra/` and `middleware/` never import `modules/`.
- No financial arithmetic here: money logic is PostgreSQL's job.
