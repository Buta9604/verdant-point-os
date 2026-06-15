# Verdant Point OS

A browser-based, offline-first **cannabis dispensary POS**.
React + TypeScript + Vite. See [`docs/POS_DESIGN_PLAN.md`](docs/POS_DESIGN_PLAN.md)
for the full design.

## Status

Phase 1 — **Foundation** scaffold:

- App shell: status bar + tab rail
- Tabs: Sales, Customers, Queue, Orders, Invoices, Inventory, Reports, Settings
- Sales tab: working catalog → cart → tax/total → tender layout (in-memory)
- Session store (Zustand) with online/offline indicator and active-customer chip

Later phases (offline sync engine, ID-scan parsing, compliance gate, real tender,
backend + METRC) are described in the design plan.

## Develop

```bash
cd apps/pos
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```
