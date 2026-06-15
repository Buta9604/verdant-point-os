import { useSession } from "../app/store";

export function StatusBar() {
  const { storeName, registerId, budtender, online, pendingSync, activeCustomer } =
    useSession();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-surface-border bg-surface-raised px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-verdant-400">Verdant Point</span>
        <span className="text-xs text-slate-500">
          {storeName} · {registerId}
        </span>
      </div>

      <div className="mx-2 hidden flex-1 md:block">
        <input
          aria-label="Global search"
          placeholder="Search products, customers, orders…  ( / )"
          className="w-full rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-verdant-500 focus:outline-none"
        />
      </div>

      {activeCustomer && (
        <div className="flex items-center gap-2 rounded-full bg-verdant-600/20 px-3 py-1 text-xs text-verdant-200">
          <span>{activeCustomer.name}</span>
          {activeCustomer.ageVerified && <span title="Age verified">✓</span>}
        </div>
      )}

      <ConnectionPill online={online} pending={pendingSync} />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verdant-600 text-sm font-semibold text-surface">
          {budtender.initials}
        </div>
        <span className="hidden text-sm text-slate-300 sm:block">{budtender.name}</span>
      </div>
    </header>
  );
}

function ConnectionPill({ online, pending }: { online: boolean; pending: number }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
        online ? "bg-verdant-600/20 text-verdant-300" : "bg-amber-500/20 text-amber-300"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${online ? "bg-verdant-400" : "bg-amber-400"}`}
      />
      {online ? "Online" : "Offline"}
      {pending > 0 && <span className="opacity-70">· {pending} queued</span>}
    </div>
  );
}
