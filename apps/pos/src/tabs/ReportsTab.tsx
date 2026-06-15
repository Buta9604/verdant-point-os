import { useMemo, useState } from "react";
import { useData } from "../stores/data";
import type { Order } from "../data/types";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

interface Perf {
  budtenderId: string;
  name: string;
  orders: number;
  items: number;
  gross: number;
  discounts: number;
  units: number;
}

export function ReportsTab() {
  const { orders, users } = useData();
  const [todayOnly, setTodayOnly] = useState(true);

  const completed = useMemo(() => {
    const from = todayOnly ? startOfToday() : 0;
    return orders.filter((o) => o.status === "completed" && (o.completedAt ?? 0) >= from);
  }, [orders, todayOnly]);

  const perf = useMemo(() => groupByBudtender(completed, users), [completed, users]);

  const storeGross = completed.reduce((s, o) => s + o.roundedTotal, 0);
  const storeOrders = completed.length;
  const avgTicket = storeOrders ? storeGross / storeOrders : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Reports</h1>
          <p className="text-sm text-slate-400">
            Per-budtender performance, attributed by login. Syncs to the backend for
            payroll/commission and manager dashboards.
          </p>
        </div>
        <div className="flex rounded-lg border border-surface-border bg-surface p-0.5 text-sm">
          <button
            onClick={() => setTodayOnly(true)}
            className={`rounded-md px-3 py-1 ${todayOnly ? "bg-verdant-600/30 text-verdant-200" : "text-slate-400"}`}
          >
            Today
          </button>
          <button
            onClick={() => setTodayOnly(false)}
            className={`rounded-md px-3 py-1 ${!todayOnly ? "bg-verdant-600/30 text-verdant-200" : "text-slate-400"}`}
          >
            All time
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Gross sales" value={`$${storeGross.toFixed(2)}`} />
        <Stat label="Orders" value={String(storeOrders)} />
        <Stat label="Avg ticket" value={`$${avgTicket.toFixed(2)}`} />
      </div>

      <section className="panel p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">Budtender leaderboard</h2>
        {perf.length === 0 ? (
          <p className="text-sm text-slate-500">No completed sales in this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-1 pr-4">Budtender</th>
                <th className="px-2 text-right">Orders</th>
                <th className="px-2 text-right">Units</th>
                <th className="px-2 text-right">Gross</th>
                <th className="px-2 text-right">Avg ticket</th>
                <th className="px-2 text-right">Discounts</th>
                <th className="px-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {perf.map((p, i) => (
                <tr key={p.budtenderId} className="border-t border-surface-border">
                  <td className="py-2 pr-4 text-slate-100">
                    {i === 0 && <span className="mr-1">🏆</span>}
                    {p.name}
                  </td>
                  <td className="px-2 text-right text-slate-300">{p.orders}</td>
                  <td className="px-2 text-right text-slate-300">{p.units}</td>
                  <td className="px-2 text-right font-semibold text-slate-100">${p.gross.toFixed(2)}</td>
                  <td className="px-2 text-right text-slate-300">
                    ${(p.orders ? p.gross / p.orders : 0).toFixed(2)}
                  </td>
                  <td className="px-2 text-right text-slate-400">${p.discounts.toFixed(2)}</td>
                  <td className="px-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full bg-verdant-500"
                        style={{ width: `${storeGross ? (p.gross / storeGross) * 100 : 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function groupByBudtender(orders: Order[], users: ReturnType<typeof useData.getState>["users"]): Perf[] {
  const map = new Map<string, Perf>();
  for (const o of orders) {
    const cur =
      map.get(o.budtenderId) ??
      {
        budtenderId: o.budtenderId,
        name: o.budtenderName || users.find((u) => u.id === o.budtenderId)?.name || "Unknown",
        orders: 0,
        items: 0,
        gross: 0,
        discounts: 0,
        units: 0,
      };
    cur.orders += 1;
    cur.items += o.lines.length;
    cur.units += o.lines.reduce((s, l) => s + l.qty, 0);
    cur.gross += o.roundedTotal;
    cur.discounts += o.discountAmount;
    map.set(o.budtenderId, cur);
  }
  return [...map.values()].sort((a, b) => b.gross - a.gross);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
    </div>
  );
}
