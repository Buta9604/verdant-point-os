import { useData } from "../stores/data";
import type { Customer, QueueEntry, QueueLane } from "../data/types";

function waitLabel(enteredAt: number): string {
  const mins = Math.floor((Date.now() - enteredAt) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function QueueTab() {
  const { queue, customers, setQueueStatus, removeFromQueue } = useData();
  const byId = (id: string) => customers.find((c) => c.id === id);

  const lanes: { key: QueueLane; title: string; tone: string }[] = [
    { key: "pos", title: "Direct POS", tone: "text-verdant-300" },
    { key: "pickup", title: "Pickup", tone: "text-amber-300" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100">Queue</h1>
        <p className="text-sm text-slate-400">
          Live waiting room. Entries arrive from the Security Gate; calling a customer
          marks them as being served.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => {
          const entries = queue
            .filter((q) => q.lane === lane.key && q.status !== "done")
            .sort((a, b) => a.enteredAt - b.enteredAt);
          return (
            <div key={lane.key} className="panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`text-sm font-semibold uppercase tracking-wide ${lane.tone}`}>
                  {lane.title}
                </h2>
                <span className="text-xs text-slate-500">{entries.length} waiting</span>
              </div>
              <ul className="space-y-2">
                {entries.length === 0 && (
                  <li className="py-6 text-center text-sm text-slate-500">Empty</li>
                )}
                {entries.map((q) => (
                  <QueueRow
                    key={q.id}
                    entry={q}
                    customer={byId(q.customerId)}
                    onServe={() => setQueueStatus(q.id, "serving")}
                    onDone={() => setQueueStatus(q.id, "done")}
                    onRemove={() => removeFromQueue(q.id)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueueRow({
  entry,
  customer,
  onServe,
  onDone,
  onRemove,
}: {
  entry: QueueEntry;
  customer?: Customer;
  onServe: () => void;
  onDone: () => void;
  onRemove: () => void;
}) {
  const serving = entry.status === "serving";
  return (
    <li
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${serving ? "bg-verdant-600/15" : "bg-surface"}`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-slate-100">
          {customer ? `${customer.firstName} ${customer.lastName}` : "Unknown"}
          {customer?.type === "medical" && (
            <span className="ml-2 rounded-full bg-sky-600/30 px-1.5 py-0.5 text-xs text-sky-200">Med</span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          waiting {waitLabel(entry.enteredAt)}
          {serving && " · being served"}
        </div>
      </div>
      {!serving ? (
        <button onClick={onServe} className="rounded-md bg-verdant-600/40 px-2.5 py-1 text-xs text-verdant-100 hover:bg-verdant-600/60">
          Call
        </button>
      ) : (
        <button onClick={onDone} className="rounded-md bg-surface-panel px-2.5 py-1 text-xs text-slate-200 hover:bg-surface-border">
          Done
        </button>
      )}
      <button onClick={onRemove} className="rounded-md px-2 py-1 text-xs text-slate-500 hover:text-rose-300" title="Remove">
        ✕
      </button>
    </li>
  );
}
