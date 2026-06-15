import { useState } from "react";
import { useSession, type ActiveCustomer } from "../app/store";

interface CartLine {
  id: string;
  name: string;
  strain: "Indica" | "Sativa" | "Hybrid";
  price: number;
  qty: number;
}

const CATEGORIES = [
  "Flower",
  "Pre-rolls",
  "Vapes",
  "Edibles",
  "Concentrates",
  "Topicals",
  "Accessories",
];

const SAMPLE_PRODUCTS = [
  { id: "p1", name: "Blue Dream 3.5g", strain: "Hybrid" as const, price: 35, thc: "22%" },
  { id: "p2", name: "Northern Lights 3.5g", strain: "Indica" as const, price: 40, thc: "19%" },
  { id: "p3", name: "Sour Diesel 1g", strain: "Sativa" as const, price: 14, thc: "24%" },
  { id: "p4", name: "Live Resin Cart 0.5g", strain: "Hybrid" as const, price: 45, thc: "85%" },
  { id: "p5", name: "Gummies 100mg", strain: "Hybrid" as const, price: 20, thc: "100mg" },
  { id: "p6", name: "Pre-roll Pack 5x", strain: "Sativa" as const, price: 30, thc: "21%" },
];

export function SalesTab() {
  const { activeCustomer, attachCustomer } = useSession();
  const [cart, setCart] = useState<CartLine[]>([]);

  const addToCart = (p: (typeof SAMPLE_PRODUCTS)[number]) =>
    setCart((c) => {
      const existing = c.find((l) => l.id === p.id);
      if (existing)
        return c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { id: p.id, name: p.name, strain: p.strain, price: p.price, qty: 1 }];
    });

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const excise = subtotal * 0.15;
  const salesTax = (subtotal + excise) * 0.0825;
  const total = subtotal + excise + salesTax;

  return (
    <div className="flex h-full gap-4">
      {/* Catalog */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <CustomerBar
          customer={activeCustomer}
          onAttach={() =>
            attachCustomer({
              id: "c1",
              name: "Alex Morgan",
              ageVerified: true,
              type: "recreational",
            })
          }
          onClear={() => attachCustomer(null)}
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                i === 0
                  ? "bg-verdant-600/30 text-verdant-200"
                  : "bg-surface-raised text-slate-400 hover:text-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-auto pb-2 lg:grid-cols-3">
          {SAMPLE_PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="panel flex flex-col items-start gap-1 p-3 text-left transition-colors hover:border-verdant-500"
            >
              <span className="text-sm font-semibold text-slate-100">{p.name}</span>
              <span className="text-xs text-slate-400">
                {p.strain} · THC {p.thc}
              </span>
              <span className="mt-auto pt-2 text-lg font-bold text-verdant-300">
                ${p.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <aside className="flex w-80 shrink-0 flex-col panel p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-300">Cart</h2>
        <div className="min-h-0 flex-1 space-y-2 overflow-auto">
          {cart.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Scan a product or tap the catalog to begin.
            </p>
          )}
          {cart.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-100">{l.name}</p>
                <p className="text-xs text-slate-500">
                  {l.qty} × ${l.price}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-200">
                ${l.price * l.qty}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-surface-border pt-3 text-sm">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Excise (15%)" value={excise} />
          <Row label="Sales tax (8.25%)" value={salesTax} />
          <div className="flex justify-between pt-1 text-base font-bold text-slate-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          className="btn-primary mt-3 w-full disabled:cursor-not-allowed"
          disabled={cart.length === 0 || !activeCustomer}
        >
          {!activeCustomer
            ? "Attach customer to tender"
            : `Tender · $${total.toFixed(2)}`}
        </button>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}

function CustomerBar({
  customer,
  onAttach,
  onClear,
}: {
  customer: ActiveCustomer | null;
  onAttach: () => void;
  onClear: () => void;
}) {
  if (!customer) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-surface-border bg-surface-raised px-4 py-3">
        <span className="text-sm text-slate-400">
          No customer attached — scan ID or search to verify age.
        </span>
        <button onClick={onAttach} className="btn-primary py-2 text-sm">
          Scan ID
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-xl bg-verdant-600/15 px-4 py-3">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-verdant-200">{customer.name}</span>
        <span className="rounded-full bg-verdant-600/30 px-2 py-0.5 text-xs text-verdant-200">
          Age verified ✓
        </span>
        <span className="text-xs capitalize text-slate-400">{customer.type}</span>
        <span className="text-xs text-slate-400">
          Daily limit: 28.5g flower equiv · used 7g
        </span>
      </div>
      <button onClick={onClear} className="text-xs text-slate-400 hover:text-slate-200">
        Clear
      </button>
    </div>
  );
}
