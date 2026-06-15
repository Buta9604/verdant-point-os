import { printPickTicket } from "../lib/print";
import { useData } from "../stores/data";
import { useSession } from "../app/store";
import { useToasts } from "../stores/toast";
import type { Order, OrderStatus } from "../data/types";

const COLUMNS: { status: OrderStatus; title: string; tone: string }[] = [
  { status: "sent_to_fulfillment", title: "New", tone: "text-sky-300" },
  { status: "in_progress", title: "In progress", tone: "text-amber-300" },
  { status: "ready", title: "Ready for pickup", tone: "text-verdant-300" },
];

export function FulfillmentTab() {
  const { orders, advanceOrder } = useData();
  const printers = useSession((s) => s.printers);
  const push = useToasts((t) => t.push);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100">Fulfillment</h1>
        <p className="text-sm text-slate-400">
          Pick tickets land here the moment a budtender sends an order. Update status as
          you prep — the originating terminal is notified live when you mark it ready.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = orders
            .filter((o) => o.status === col.status)
            .sort((a, b) => a.sentAt - b.sentAt);
          return (
            <div key={col.status} className="panel p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className={`text-sm font-semibold uppercase tracking-wide ${col.tone}`}>
                  {col.title}
                </h2>
                <span className="text-xs text-slate-500">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">None</p>
                )}
                {items.map((o) => (
                  <FulfillCard
                    key={o.id}
                    order={o}
                    onStart={() => advanceOrder(o.id, "in_progress")}
                    onReady={() => {
                      advanceOrder(o.id, "ready");
                      push(`Order #${o.number} marked ready → ${o.terminalName} notified`, "success");
                    }}
                    onReprint={() => {
                      printPickTicket(o, printers.pickTicket);
                      push(`Reprinting pick ticket #${o.number}`, "info");
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FulfillCard({
  order,
  onStart,
  onReady,
  onReprint,
}: {
  order: Order;
  onStart: () => void;
  onReady: () => void;
  onReprint: () => void;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-100">#{order.number}</span>
        <span className="rounded-md bg-verdant-600/30 px-2 py-0.5 text-xs font-semibold text-verdant-100">
          {order.terminalName}
        </span>
      </div>
      <div className="mt-0.5 text-xs text-slate-500">
        {order.customerName} · {order.budtenderName}
      </div>
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {order.lines.map((l) => (
          <li key={l.productId} className="flex justify-between">
            <span>
              {l.qty}× {l.name}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        {order.status === "sent_to_fulfillment" && (
          <button onClick={onStart} className="flex-1 rounded-lg bg-amber-500/80 px-3 py-1.5 text-sm font-medium text-surface hover:bg-amber-400">
            Start
          </button>
        )}
        {order.status === "in_progress" && (
          <button onClick={onReady} className="flex-1 rounded-lg bg-verdant-500 px-3 py-1.5 text-sm font-medium text-surface hover:bg-verdant-400">
            Mark ready
          </button>
        )}
        {order.status === "ready" && (
          <span className="flex-1 rounded-lg bg-verdant-600/20 px-3 py-1.5 text-center text-sm text-verdant-200">
            Awaiting pickup
          </span>
        )}
        <button onClick={onReprint} className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-slate-300 hover:text-slate-100" title="Reprint pick ticket">
          🖨
        </button>
      </div>
    </div>
  );
}
