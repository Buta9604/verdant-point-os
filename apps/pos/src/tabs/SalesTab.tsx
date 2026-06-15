import { useMemo, useState } from "react";
import { CATEGORIES, SEED_PRODUCTS, type Product } from "../data/seed";
import {
  categoryRule,
  METER_LABEL,
  METER_LIMITS,
  type Meter,
} from "../data/ocm";
import { computeTotals } from "../lib/pricing";
import { searchCustomers } from "../lib/customers";
import { printPickTicket, printReceipt } from "../lib/print";
import { ageFromDob, SAMPLE_SCANS } from "../data/license";
import { useData } from "../stores/data";
import { useSession, usePermissions } from "../app/store";
import { useToasts } from "../stores/toast";
import type { Customer, Order, OrderLine } from "../data/types";

interface CartLine extends OrderLine {
  strain?: string;
}

export function SalesTab() {
  const session = useSession();
  const perms = usePermissions();
  const push = useToasts((t) => t.push);
  const { customers, orders, findByLicense, recordEntry, createOrder } = useData();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);

  const customer = customers.find((c) => c.id === session.activeCustomer?.id) ?? null;

  // OCM meters from the current cart.
  const meterUsed = useMemo(() => {
    const used: Record<Meter, number> = { flower: 0, concentrate: 0, none: 0 };
    for (const l of cart) used[categoryRule(l.category).meter] += l.meterGrams * l.qty;
    return used;
  }, [cart]);

  const totals = computeTotals(cart, discountPct);

  function attachCustomer(c: Customer) {
    session.attachCustomer({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      ageVerified: ageFromDob(c.dob) >= 21,
      type: c.type,
    });
  }

  function addToCart(p: Product) {
    const meter = categoryRule(p.category).meter;
    if (meter !== "none") {
      const next = meterUsed[meter] + p.meterGrams;
      if (next > METER_LIMITS[meter] && !perms.canOverrideLimit) {
        push(`Over OCM ${meter} limit (${METER_LIMITS[meter]} g). Manager override required.`, "warn");
        return;
      }
    }
    setCart((c) => {
      const existing = c.find((l) => l.productId === p.id);
      if (existing)
        return c.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...c,
        {
          productId: p.id,
          name: p.name,
          category: p.category,
          qty: 1,
          meterGrams: p.meterGrams,
          price: p.price,
          strain: p.strain,
        },
      ];
    });
  }

  function sendToFulfillment() {
    if (!customer || cart.length === 0) return;
    const order = createOrder({
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      terminalId: session.terminalId,
      terminalName: session.terminalName,
      budtenderName: session.userName,
      lines: cart.map(({ strain: _strain, ...l }) => l),
      discountPct,
    });
    printPickTicket(order, session.printers.pickTicket);
    push(`Order #${order.number} sent to fulfillment · pick ticket → ${session.printers.pickTicket}`, "success");
    setCart([]);
    setDiscountPct(0);
  }

  const products = SEED_PRODUCTS.filter((p) => p.category === category);
  const pending = orders.filter(
    (o) =>
      o.terminalId === session.terminalId &&
      (o.status === "sent_to_fulfillment" || o.status === "in_progress" || o.status === "ready"),
  );

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <CustomerAttach
          customer={customer}
          meterUsed={meterUsed}
          onScan={(license) => {
            const found = findByLicense(license);
            if (!found) {
              push("Not found — send the customer through the Security Gate first.", "warn");
              return;
            }
            if (ageFromDob(found.dob) < 21) {
              push("Customer is under 21 — cannot sell.", "alert");
              return;
            }
            recordEntry(found.id);
            attachCustomer(found);
          }}
          onPick={attachCustomer}
          onClear={() => session.attachCustomer(null)}
          customers={customers}
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                c === category
                  ? "bg-verdant-600/30 text-verdant-200"
                  : "bg-surface-raised text-slate-400 hover:text-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">{categoryRule(category).limitLabel}</p>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-auto pb-2 lg:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={!customer}
              className="panel flex flex-col items-start gap-1 p-3 text-left transition-colors hover:border-verdant-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-sm font-semibold text-slate-100">{p.name}</span>
              <span className="text-xs text-slate-400">
                {p.strain ? `${p.strain} · ` : ""}THC {p.thc}
              </span>
              <span className="mt-auto pt-2 text-lg font-bold text-verdant-300">${p.price}</span>
            </button>
          ))}
        </div>

        {pending.length > 0 && <PendingStrip orders={pending} />}
      </div>

      <Cart
        cart={cart}
        totals={totals}
        discountPct={discountPct}
        canDiscount={perms.canDiscount}
        maxDiscountPct={perms.maxDiscountPct}
        onDiscount={setDiscountPct}
        meterUsed={meterUsed}
        customerAttached={!!customer}
        onSend={sendToFulfillment}
        onRemove={(id) => setCart((c) => c.filter((l) => l.productId !== id))}
      />
    </div>
  );
}

function CustomerAttach({
  customer,
  meterUsed,
  onScan,
  onPick,
  onClear,
  customers,
}: {
  customer: Customer | null;
  meterUsed: Record<Meter, number>;
  onScan: (license: string) => void;
  onPick: (c: Customer) => void;
  onClear: () => void;
  customers: Customer[];
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchCustomers(customers, query), [customers, query]);

  if (customer) {
    return (
      <div className="rounded-xl bg-verdant-600/15 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-verdant-200">
              {customer.firstName} {customer.lastName}
            </span>
            <span className="rounded-full bg-verdant-600/30 px-2 py-0.5 text-xs text-verdant-200">
              Age {ageFromDob(customer.dob)} ✓
            </span>
            <span className="text-xs capitalize text-slate-400">{customer.type}</span>
            {customer.flags.length > 0 && (
              <span className="text-xs text-amber-300">⚑ {customer.flags.join(", ")}</span>
            )}
          </div>
          <button onClick={onClear} className="text-xs text-slate-400 hover:text-slate-200">
            Clear
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <MeterBar meter="flower" used={meterUsed.flower} />
          <MeterBar meter="concentrate" used={meterUsed.concentrate} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-surface-border bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          className="inp flex-1"
          placeholder="Customer says their name — search to bring them to front"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="relative">
          <select
            className="inp appearance-none pr-8"
            value=""
            onChange={(e) => e.target.value && onScan(e.target.value)}
          >
            <option value="">Scan ID…</option>
            {SAMPLE_SCANS.map((s) => (
              <option key={s.key} value={s.license.licenseNumber}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {query && (
        <ul className="mt-2 space-y-1">
          {matches.length === 0 && <li className="text-sm text-slate-500">No matches.</li>}
          {matches.map(({ customer: c, mostRecentEntry }) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  onPick(c);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-lg bg-surface px-3 py-2 text-left text-sm hover:bg-surface-panel"
              >
                <span className="text-slate-100">
                  {c.firstName} {c.lastName}{" "}
                  <span className="text-xs text-slate-500">· {c.dob}</span>
                </span>
                {mostRecentEntry && (
                  <span className="rounded-full bg-verdant-500 px-2 py-0.5 text-xs font-semibold text-surface">
                    Just entered
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MeterBar({ meter, used }: { meter: Exclude<Meter, "none">; used: number }) {
  const limit = METER_LIMITS[meter];
  const pct = Math.min(100, (used / limit) * 100);
  const over = used > limit;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{METER_LABEL[meter]}</span>
        <span className={over ? "text-rose-300" : ""}>
          {used.toFixed(1)} / {limit} g
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full ${over ? "bg-rose-500" : "bg-verdant-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Cart({
  cart,
  totals,
  discountPct,
  canDiscount,
  maxDiscountPct,
  onDiscount,
  customerAttached,
  onSend,
  onRemove,
}: {
  cart: CartLine[];
  totals: ReturnType<typeof computeTotals>;
  discountPct: number;
  canDiscount: boolean;
  maxDiscountPct: number;
  onDiscount: (pct: number) => void;
  meterUsed: Record<Meter, number>;
  customerAttached: boolean;
  onSend: () => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <aside className="flex w-80 shrink-0 flex-col panel p-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-300">Cart</h2>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto">
        {cart.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Scan a product or tap the catalog to begin.
          </p>
        )}
        {cart.map((l) => (
          <div key={l.productId} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-100">{l.name}</p>
              <p className="text-xs text-slate-500">
                {l.qty} × ${l.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">${l.price * l.qty}</span>
              <button onClick={() => onRemove(l.productId)} className="text-xs text-slate-500 hover:text-rose-300">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {canDiscount && cart.length > 0 && (
        <label className="mt-3 flex items-center justify-between gap-2 text-sm text-slate-400">
          Discount %
          <input
            type="number"
            min={0}
            max={maxDiscountPct}
            value={discountPct}
            onChange={(e) =>
              onDiscount(Math.max(0, Math.min(maxDiscountPct, Number(e.target.value))))
            }
            className="inp w-20 text-right"
          />
        </label>
      )}

      <div className="mt-3 space-y-1 border-t border-surface-border pt-3 text-sm">
        <Row label="Subtotal" value={totals.subtotal} />
        {totals.discountAmount > 0 && (
          <Row label={`Discount (${discountPct}%)`} value={-totals.discountAmount} />
        )}
        <Row label="Excise (13%)" value={totals.excise} />
        <div className="flex justify-between pt-1 text-base font-bold text-slate-100">
          <span>Total</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="btn-primary mt-3 w-full disabled:cursor-not-allowed"
        disabled={cart.length === 0 || !customerAttached}
        onClick={onSend}
      >
        {!customerAttached ? "Attach customer first" : "Send to fulfillment →"}
      </button>
    </aside>
  );
}

function PendingStrip({ orders }: { orders: Order[] }) {
  return (
    <div className="panel p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        My orders in fulfillment
      </h3>
      <div className="flex gap-3 overflow-x-auto">
        {orders.map((o) => (
          <PendingCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}

function PendingCard({ order }: { order: Order }) {
  const { completeOrder } = useData();
  const printers = useSession((s) => s.printers);
  const push = useToasts((t) => t.push);
  const [tendering, setTendering] = useState(false);

  const statusLabel: Record<string, { text: string; cls: string }> = {
    sent_to_fulfillment: { text: "Sent", cls: "bg-sky-600/20 text-sky-200" },
    in_progress: { text: "Preparing", cls: "bg-amber-500/20 text-amber-200" },
    ready: { text: "Ready ✓", cls: "bg-verdant-500 text-surface" },
  };
  const s = statusLabel[order.status];

  function tender(method: Order["paymentMethod"]) {
    completeOrder(order.id, method);
    const updated = useData.getState().orders.find((o) => o.id === order.id);
    if (updated) printReceipt(updated, printers.receipt);
    push(`Order #${order.number} tendered (${method}) · receipt printed`, "success");
    setTendering(false);
  }

  return (
    <div className="w-56 shrink-0 rounded-xl border border-surface-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-100">#{order.number}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.text}</span>
      </div>
      <div className="mt-0.5 truncate text-xs text-slate-500">{order.customerName}</div>
      <div className="mt-2 text-sm text-slate-300">{order.lines.length} items · ${order.total.toFixed(2)}</div>

      {order.status === "ready" && !tendering && (
        <button onClick={() => setTendering(true)} className="btn-primary mt-2 w-full py-1.5 text-sm">
          Tender
        </button>
      )}
      {tendering && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-slate-400">
            Total ${order.total.toFixed(2)}
            {/* rounded cash total computed at completion */}
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(["cash", "card", "debit"] as const).map((m) => (
              <button
                key={m}
                onClick={() => tender(m)}
                className="rounded-md bg-verdant-600/30 px-2 py-1 text-xs capitalize text-verdant-100 hover:bg-verdant-600/50"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span>{value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}</span>
    </div>
  );
}
