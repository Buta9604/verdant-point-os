# Verdant Point OS

A browser-based, offline-first **cannabis dispensary POS**.
React + TypeScript + Vite. See [`docs/POS_DESIGN_PLAN.md`](docs/POS_DESIGN_PLAN.md)
for the full design.

## Status

The full counter workflow runs end-to-end in the browser (in-memory + cross-window
live sync via BroadcastChannel; the real backend arrives in Phase 2/11):

**Security Gate → POS → Fulfillment → Tender**

- **Gate** (security): scan ID → new vs returning, auto age-check (under-21 denied),
  create profile auto-filled from the license, edit/update, then *let in* or add to
  the **Pickup** or **Direct POS** queue.
- **Queue**: live two-lane waiting room fed by the gate.
- **Sales** (budtender): bring a customer to front by scan or name search — when names
  collide, the most-recent entrant is flagged **"Just entered."** OCM per-category
  purchase limits (flower / concentrate meters) enforced live. Discounts gated by role.
  **Send to fulfillment** prints a pick ticket (stamped with the terminal name) to the
  assigned printer.
- **Fulfillment** (back of house): pick tickets land instantly; advance New →
  Preparing → Ready. Marking ready fires a **live chime + banner** on the originating
  terminal.
- **Tender**: budtender picks up the ready order and tenders (cash/card/debit) with
  configurable **penny/nickel rounding** on cash; receipt prints.
- **Settings**: per-terminal identity + printer routing, rounding config, and the
  backend-synced **role-permission matrix**.

Plus: **per-budtender PIN login** (every sale attributed for **performance reports**),
an **upsell recommendation engine** to lift basket size, **loyalty** earn/redeem at
tender, and a real **Invoices** ledger with reprint + permissioned refunds. See
[`docs/PHASE1_FEATURES.md`](docs/PHASE1_FEATURES.md) for the full status and gap analysis.

Each browser window is its own terminal — open two windows (e.g. one as Budtender on
*Terminal 3*, one as Fulfillment) to watch the live sync. **Demo PINs:** Jordan 1111,
Mia 2222, Diego 3333, Pat (manager) 9999, Sam (security) 4444, Riley (fulfillment) 5555.

Earlier phases (offline outbox/PWA, real PDF417 hardware, backend + METRC) are
detailed in the design plan.

## Develop

```bash
cd apps/pos
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```
