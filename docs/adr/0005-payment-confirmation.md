# 0005 — Cash/card require cashier confirmation; debt requires customer consent

**Status:** Accepted

## Decision

- The customer chooses the payment method (cash, card, debt).
- Cash/card: the invoice becomes `paid` only after the **cashier confirms** receiving the money.
- Debt: the customer approves in their app; the credit limit is checked inside the transaction;
  the ledger entry is recorded and both sides can see the operation.
- Walk-in sales (no customer) are stored as invoices only and never touch a customer balance.
- The UI may show an estimated total while building a cart, but the database computes the final
  prices, VAT and totals when the invoice is created.
- KYC / national-ID verification is out of scope for the first version.

Implementation: Phases 4–5.
