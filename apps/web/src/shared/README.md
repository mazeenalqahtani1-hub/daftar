# Shared

Code with no product knowledge, usable by every feature.

- `ui/` generic components (buttons, inputs, layout)
- `lib/` pure helpers (formatting, i18n)
- `api-client/` typed HTTP client for apps/api
- `config/` validated public environment (`env`)

`shared/` must not import from `features/` or `app/`.
