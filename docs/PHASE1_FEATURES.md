# Phase 1 — Feature status & gap analysis

Frontend POS, browser-based, with cross-window live sync standing in for the
backend until Phase 2/11.

## ✅ Implemented

### Workflow (entrance → tender)
- **Security Gate**: ID scan → new vs returning, automatic **under-21 denial**,
  create profile auto-filled from the license, edit/update, then *let in* or queue
  for **Pickup** / **Direct POS**.
- **Queue**: live two-lane waiting room fed by the gate (call / serve / done).
- **Sales**: attach customer by scan or name search; same-name **"Just entered"**
  disambiguation; live **OCM per-category limits** (flower 85 g / concentrate 24 g);
  **Send to fulfillment** prints a terminal-stamped pick ticket.
- **Fulfillment**: New → Preparing → Ready board; marking ready fires a **live chime
  + banner** on the originating terminal.
- **Tender**: cash/card/debit with **penny/nickel rounding** on cash; receipt prints.

### Staff, sales-lift & money
- **Per-budtender login** with PIN lock screen + quick switch; **every sale attributed
  to the budtender** (`budtenderId`).
- **Reports**: per-budtender performance leaderboard (orders, units, gross, avg ticket,
  discounts, share) with Today / All-time toggle and store totals.
- **Recommendation engine** on Sales: customer's usuals → cart complements →
  best-sellers, one tap to add (drives basket size).
- **Loyalty**: points earned per sale, **redemption at tender** (100 pts = $5), reversed
  on refund.
- **Discounts** gated by role with a max-percent cap.
- **Invoices**: searchable ledger, **reprint**, and **permissioned refunds** (with loyalty
  reversal).
- **Settings**: per-terminal identity + **printer routing** (receipt / pick ticket /
  label), rounding config, and the backend-synced **role-permission matrix**.

## 🔭 Still needed (next up in Phase 1, before the backend phase)
- **Park / hold sale** and multi-cart so a budtender can serve the next person.
- **Returns with item-level restock** and partial refunds (current refund is whole-order).
- **Inventory decrement on sale** + low-stock flags (Inventory tab is still a scaffold).
- **Drawer / shift management**: open/close, cash counts, payouts, **Z-report**.
- **Online preorders intake** feeding the Orders tab → fulfillment.
- **Per-item OCM equivalency edge cases** (edibles by THC mg, medical vs rec limits).
- **Manager override flow** (PIN-approved) for over-limit / over-cap discounts.
- **Receipt/label content polish** and email/SMS receipt.
- **Bulk product search & favorites grid**, keyboard-only ring-up shortcuts.

## ⏭ Deferred to later phases (already in the design plan)
- **Phase 2** offline outbox + PWA/service worker (durable offline selling).
- Real **PDF417 hardware** ID parsing + barcode/printer/drawer/terminal drivers.
- **Backend + METRC** traceability, real auth, and the source-of-truth for users,
  roles, pricing, limits, and reports.
