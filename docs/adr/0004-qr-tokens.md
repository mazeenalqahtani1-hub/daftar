# 0004 — Random, revocable QR tokens; only the hash is stored

**Status:** Accepted

## Decision

- Each customer has a QR token: 256 random bits (base64url). The raw token is shown only in the customer's app.
- The database stores only `SHA-256(token)`. The QR contains no phone number, name or guessable id.
- Tokens can be revoked and rotated at any time.
- Resolving a token passes through backend/database authorization (active store member with the right
  permission) and returns the minimum information (a short display name).
- A QR only **identifies** the customer; it never **authorizes** a debt — the customer approves in their own app.

Implementation: Phase 5.
