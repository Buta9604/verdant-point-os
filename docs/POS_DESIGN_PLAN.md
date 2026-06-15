# Verdant Point OS — Cannabis Dispensary POS

A browser-based, offline-first point-of-sale system for a cannabis dispensary.
Built with React + TypeScript + Vite. Designed around a clean, fast workflow
from **ID scan → cart → compliance check → tender → receipt**.

---

## 1. Goals & Principles

- **Fast at the counter.** Every common action reachable in ≤2 clicks or a keyboard shortcut. A budtender should ring a sale without leaving the keyboard.
- **Offline-first.** The terminal keeps selling when the internet drops. All sales are written to a local store first, then synced. No connection = no lost sale.
- **Compliant by default.** Age verification, per-customer purchase limits, and state traceability (METRC-style) are enforced *before* tender, not after.
- **Touch + keyboard + scanner.** Works with a touchscreen, a keyboard, and hardware peripherals (ID scanner, barcode scanner, receipt printer, cash drawer, card terminal).
- **Clean, calm UI.** Large tap targets, high contrast, minimal color noise. Green accent ("verdant"), neutral surfaces, clear state.

---

## 2. Tech Stack & Architecture

### Frontend
- **React 18 + TypeScript + Vite** — SPA, fast HMR, small bundle.
- **State:** Zustand for app/session state; TanStack Query for server data + cache.
- **Routing:** React Router (tab-based shell).
- **Styling:** Tailwind CSS + a small component library (Radix UI primitives) for accessible dialogs, menus, etc.
- **Offline storage:** IndexedDB via Dexie.js (local cart, catalog cache, queued transactions).
- **PWA:** Service worker (Workbox) so the app installs to the register and boots offline.
- **Forms/validation:** React Hook Form + Zod (shared schemas with backend).

### Backend
- **Runtime:** Node.js + TypeScript (Fastify) — fast, schema-first.
- **DB:** PostgreSQL (transactional core) + Prisma ORM.
- **Sync:** REST + an outbox/idempotency-key pattern so offline transactions replay exactly once.
- **Auth:** JWT access + refresh, PIN-based quick-switch for budtenders on a shared register.
- **Realtime:** WebSocket channel for the live queue and multi-register inventory updates.
- **Integrations layer:** adapters for METRC (state traceability), payment processor, and ID-parsing.

### Offline-first model (key design)
```
Budtender action
      │
      ▼
 Local store (IndexedDB)  ←── source of truth for the active shift
      │  (optimistic UI, instant)
      ▼
 Outbox queue  ──(when online)──►  Backend API  ──►  Postgres + METRC
      ▲                                   │
      └──────────  sync/pull  ◄───────────┘  (catalog, prices, limits)
```
- Each transaction carries a client-generated UUID + idempotency key.
- Catalog, customers, and purchase-limit rules are pulled and cached on login and refreshed in the background.
- A visible **connection/sync indicator** shows online/offline + pending-sync count.

---

## 3. Frontend — App Shell & Navigation

A persistent left (or top) **tab rail** + a top status bar.

**Top status bar (always visible):**
- Store name + register ID
- Logged-in budtender (avatar/initials) + quick PIN-switch
- Connection status + pending-sync count
- Current customer chip (when a customer is attached to the sale)
- Cash drawer / shift status
- Global search (products, customers, orders) — `/` to focus

**Primary tabs:**
1. **Sales** (default) — the register / ring-up screen
2. **Customers** — lookup, profiles, history, loyalty
3. **Queue** — check-in / waiting room flow
4. **Orders** — online/preorders, pickup, fulfillment
5. **Invoices** — completed transactions, reprints, refunds
6. **Inventory** *(supporting)* — stock lookup, counts
7. **Reports** *(supporting)* — sales, compliance, drawer/Z-report
8. **Settings** *(supporting)* — hardware, users, store config

---

## 4. Tab-by-Tab Feature Plan

### 4.1 Sales tab (the register)
The core screen. Three-pane layout: **catalog** (left/center), **cart** (right), **action bar** (bottom).

- **Customer attach bar** at top: scan ID or search to attach customer; shows age-verified ✓, medical/rec status, and **remaining purchase limits** (flower/concentrate/edible equivalents) live.
- **Product catalog:** category tabs (Flower, Pre-rolls, Vapes, Edibles, Concentrates, Topicals, Accessories), search, and scan-to-add (barcode). Each product card shows name, strain type (Indica/Sativa/Hybrid), THC/CBD %, price, and stock.
- **Cart:** line items with qty steppers, weight/equivalency, per-line discount, item notes. Running subtotal, taxes (excise + sales), and **compliance meter** (how much of the legal limit this cart consumes).
- **Actions:** apply discount/loyalty, hold/park sale, add note, void line, clear cart, and **Tender** (the big primary button).
- **Keyboard-first:** `F2` attach customer, `F3` search product, `F4` discount, `F8` park, `Enter`/`F12` tender.
- **Parked sales:** stash a cart to serve the next customer, resume later.

### 4.2 Customers tab
- **Search** by name, phone, license #, or scan ID.
- **Profile:** contact info, ID/age status + expiry, medical card (number, expiry, recommendation limits), rec vs medical, loyalty points/tier, notes/flags (e.g., "do not sell" compliance flag).
- **Purchase history** with reprint, and **lifetime/period purchase totals** for limit tracking.
- **Quick create** from an ID scan (autofill name, DOB, address, license #, expiry).
- **Loyalty:** points balance, redemption, tier, marketing opt-in (with consent tracking).

### 4.3 Queue tab
- **Check-in:** scan ID at the door → customer enters the queue with age/ID pre-verified.
- **Live queue list** (WebSocket): name, wait time, medical/rec, assigned budtender, status (Waiting → With budtender → Done).
- **Assign/claim** a customer to a register; calling a customer pre-attaches them to the Sales tab.
- **Separate lanes** (optional): medical vs recreational, express pickup vs full service.
- Wait-time metrics surfaced for the floor manager.

### 4.4 Orders tab
- **Online/preorders & pickup:** list of incoming orders with status (New → Picking → Ready → Picked up).
- **Pick/pack flow:** check stock, reserve inventory, mark ready, notify customer.
- **Convert to sale:** load an order straight into the Sales cart for ID-verify + tender at pickup.
- Filters by status, fulfillment type (pickup/delivery/in-store), and time.

### 4.5 Invoices tab
- **Completed transactions** ledger: searchable/filterable by date, budtender, customer, amount, payment type.
- **Detail view:** full line items, taxes, tender breakdown, compliance snapshot, METRC sync status.
- **Reprint** receipt/invoice, **email/SMS** copy.
- **Refunds / returns** (permissioned): full or partial, with restock + METRC reversal.
- **Daily totals** and export (CSV).

### 4.6 Inventory tab (supporting)
- Stock lookup with on-hand, package IDs, room/location, and low-stock alerts.
- Quick adjustments, receiving, and cycle counts (with reason codes + audit trail).
- METRC package linkage per SKU/lot.

### 4.7 Reports tab (supporting)
- **Drawer:** open/close shift, cash counts, payouts, **Z-report**.
- **Sales:** by day/budtender/category/product; gross, discounts, taxes.
- **Compliance:** sales over/near limits, ID-verification log, METRC sync exceptions.

### 4.8 Settings tab (supporting)
- **Hardware:** pair/test ID scanner, barcode scanner, receipt printer, cash drawer, card terminal.
- **Users & roles:** budtender / manager / admin; PIN setup; permissions (refunds, discounts, voids).
- **Store config:** tax rules, purchase-limit rules, categories, receipt template, METRC credentials.

---

## 5. The Core Workflow — ID Scan → Tender

This is the spine of the system. Designed to be linear, fast, and hard to do wrong.

```
1. CHECK-IN (Queue) or START SALE (Sales)
     └─ Scan driver license / ID (PDF417)
          ├─ Parse name, DOB, address, license #, expiry
          ├─ Compute age  →  block if <21 (or <18 medical w/ valid card)
          ├─ Check ID expiry  →  warn/block if expired
          └─ Match or create customer record
                    │
                    ▼
2. ATTACH CUSTOMER to the sale
     └─ Show age-verified ✓, rec/medical status, loyalty,
        and REMAINING PURCHASE LIMITS for the day
                    │
                    ▼
3. BUILD CART
     └─ Scan barcodes / tap catalog
          ├─ Each add re-checks live purchase-limit meter
          ├─ Compliance meter blocks exceeding the legal limit
          └─ Apply discounts / loyalty
                    │
                    ▼
4. PRE-TENDER COMPLIANCE GATE (automatic)
     ├─ Age verified?            ✓
     ├─ Within purchase limits?  ✓
     ├─ Valid medical card (if medical pricing)?  ✓
     └─ Inventory reserved + METRC package check   ✓
                    │
                    ▼
5. TENDER
     ├─ Choose payment: cash / debit / card / split
     ├─ Cash → drawer kicks, change calculated
     ├─ Card → send total to terminal, await approval
     └─ Compute excise + sales tax in the total
                    │
                    ▼
6. FINALIZE
     ├─ Write transaction to local store (instant)
     ├─ Decrement inventory, record METRC sale (queued if offline)
     ├─ Print receipt + open drawer
     ├─ Update loyalty points
     └─ Clear cart → ready for next customer
                    │
                    ▼
7. SYNC (background)
     └─ Outbox replays to backend + METRC when online (idempotent)
```

**Why this works:** verification happens up front (at check-in or sale start), the compliance gate is automatic and non-bypassable, and tender is a single decisive step. Offline, every step still completes locally and syncs later.

---

## 6. Cannabis Compliance Layer

- **Age & ID verification:** PDF417 parse, age computation, expiry check, audit log of every verification.
- **Purchase limits:** configurable daily limits with flower-equivalency math across categories (flower / concentrate / edible THC); enforced live in the cart and at the gate.
- **Medical vs recreational:** separate pricing/tax, medical-card capture + expiry, recommendation-based limits.
- **State traceability (METRC adapter):** package IDs per line, sale reporting, refund reversals, sync-exception queue with retry.
- **Taxes:** excise + state/local sales tax, configurable by jurisdiction.
- **Audit trail:** immutable log of verifications, voids, refunds, discounts, and limit overrides (manager-permissioned).

---

## 7. Hardware Integration Layer

A pluggable `devices/` module with a common interface per device, so the UI calls `scanner.read()`, `printer.print()`, etc., regardless of vendor.

- **ID / license scanner:** keyboard-wedge or serial; PDF417 decoder; maps AAMVA fields → customer.
- **Barcode scanner:** keyboard-wedge capture with a focus-trap input; debounced, prefix/suffix aware.
- **Receipt printer:** ESC/POS over WebUSB/serial (or a local print agent); templated receipts.
- **Cash drawer:** kick pulse via the printer.
- **Card terminal:** processor SDK adapter (e.g., semi-integrated terminal); send amount, await result, attach reference to the sale.
- All devices are **testable from Settings** with a status indicator.

---

## 8. Data Model (core entities)

`Store`, `Register`, `User(role,pin)`, `Shift/Drawer`, `Customer(idInfo, medicalCard, loyalty, flags)`, `Product(category, strain, thc/cbd, price, metrcPackage)`, `InventoryItem(onHand, location, lot)`, `Cart/Sale(lines, taxes, discounts, tenders, status)`, `Order(fulfillment, status)`, `Invoice`, `QueueEntry`, `ComplianceLog`, `LimitRule`, `OutboxEvent(idempotencyKey)`.

---

## 9. Build Phases (proposed)

1. **Foundation** — Vite + React + TS scaffold, Tailwind, routing, app shell, tab navigation, status bar, auth/PIN, design tokens.
2. **Offline core** — Dexie store, TanStack Query, outbox/sync engine, connection indicator, PWA/service worker.
3. **Sales register** — catalog, cart, discounts, taxes, park/resume, keyboard shortcuts.
4. **Customers + ID scan** — profiles, ID parsing, age/expiry checks, quick-create.
5. **Compliance** — purchase limits + equivalency, pre-tender gate, medical/rec, audit log.
6. **Tender** — payment methods, cash/change, card-terminal adapter, receipt + drawer, finalize.
7. **Queue** — check-in, live queue (WebSocket), assign/claim, call-to-register.
8. **Orders** — preorders, pick/pack, convert-to-sale.
9. **Invoices** — ledger, reprints, refunds/returns + METRC reversal.
10. **Inventory / Reports / Settings** — stock, counts, drawer/Z-report, hardware config, users/roles.
11. **Backend + METRC** — Fastify API, Postgres/Prisma, sync endpoints, METRC adapter, payment integration.

Phases 1–3 deliver a usable register; 4–6 complete the ID-scan-to-tender spine; the rest layer on the full tab set and backend.

---

## 10. Repository Layout (proposed)

```
verdant-point-os/
├─ apps/
│  ├─ pos/                 # React + Vite POS (this is the browser POS)
│  │  ├─ src/
│  │  │  ├─ app/           # shell, routing, providers
│  │  │  ├─ tabs/          # sales, customers, queue, orders, invoices, ...
│  │  │  ├─ features/      # cart, compliance, tender, loyalty
│  │  │  ├─ devices/       # scanner, printer, drawer, terminal adapters
│  │  │  ├─ offline/       # dexie, outbox, sync
│  │  │  ├─ components/    # shared UI
│  │  │  └─ lib/           # api client, utils, hooks
│  └─ api/                 # Fastify + Prisma backend (later phase)
├─ packages/
│  └─ shared/              # Zod schemas, types, equivalency/limit logic
└─ docs/                   # this plan + ADRs
```
