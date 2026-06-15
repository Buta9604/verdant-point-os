import { useMemo, useState } from "react";
import { printReceipt } from "../lib/print";
import { useData } from "../stores/data";
import { useSession, usePermissions } from "../app/store";
import { useToasts } from "../stores/toast";
import type { Order } from "../data/types";

export function InvoicesTab() {
  const { orders, refundOrder } = useData();
  const perms = usePermissions();
  const printers = useSession((s) => s.printers);
  const push = useToasts((t) => t.push);
  const [query, setQuery] = useState("");

  const invoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => o.status === "completed" || o.status === "refunded")
      .filter(
        (o) =>
          !q ||
          String(o.number).includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.budtenderName.toLowerCase().includes(q),
      )
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  }, [orders, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Invoices</h1>
        <p className="text-sm text-slate-400">
          Completed transactions. Reprint receipts or process refunds (permissioned).
        </p>
      </header>

      <input
        className="inp w-full max-w-sm"
        placeholder="Search by order #, customer, or budtender"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="panel divide-y divide-surface-border">
        {invoices.length === 0 && (
          <p className="p-5 text-sm text-slate-500">No invoices yet.</p>
        )}
        {invoices.map((o) => (
          <InvoiceRow
            key={o.id}
            order={o}
            canRefund={perms.canRefund}
            onReprint={() => {
              printReceipt(o, printers.receipt);
              push(`Reprinting invoice #${o.number}`, "info");
            }}
            onRefund={() => {
              refundOrder(o.id);
              push(`Order #${o.number} refunded`, "warn");
            }}
          />
        ))}
      </div>
    </div>
  );
}

function InvoiceRow({
  order,
  canRefund,
  onReprint,
  onRefund,
}: {
  order: Order;
  canRefund: boolean;
  onReprint: () => void;
  onRefund: () => void;
}) {
  const refunded = order.status === "refunded";
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-16 font-semibold text-slate-100">#{order.number}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-slate-200">
          {order.customerName}
          {refunded && (
            <span className="ml-2 rounded-full bg-rose-600/20 px-2 py-0.5 text-xs text-rose-200">
              Refunded
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {order.completedAt ? new Date(order.completedAt).toLocaleString() : "—"} ·{" "}
          {order.budtenderName} · {order.terminalName} · {order.paymentMethod ?? "—"}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-slate-100">${order.roundedTotal.toFixed(2)}</div>
        {order.pointsEarned > 0 && (
          <div className="text-xs text-verdant-300">+{order.pointsEarned} pts</div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onReprint}
          className="rounded-md bg-surface-panel px-3 py-1.5 text-xs text-slate-200 hover:bg-surface-border"
        >
          Reprint
        </button>
        {canRefund && !refunded && (
          <button
            onClick={onRefund}
            className="rounded-md border border-rose-500/40 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-600/20"
          >
            Refund
          </button>
        )}
      </div>
    </div>
  );
}
