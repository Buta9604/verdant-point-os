import { roleLabel, useSession } from "../app/store";

export function StatusBar() {
  const { storeName, terminalName, currentUser, online, activeCustomer, logout } =
    useSession();
  const userName = currentUser?.name ?? "—";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-surface-border bg-surface-raised px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-verdant-400">Verdant Point</span>
        <span className="hidden text-xs text-slate-500 lg:block">
          {storeName} · {terminalName}
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

      <ConnectionPill online={online} />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verdant-600 text-sm font-semibold text-surface">
          {initials}
        </div>
        <div className="hidden leading-tight sm:block">
          <div className="text-sm text-slate-200">{userName}</div>
          <div className="text-xs text-slate-500">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </div>
        </div>
        <button
          onClick={logout}
          className="ml-1 rounded-lg border border-surface-border px-2 py-1 text-xs text-slate-400 hover:text-slate-100"
          title="Lock / switch user"
        >
          Lock
        </button>
      </div>
    </header>
  );
}

function ConnectionPill({ online }: { online: boolean }) {
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
    </div>
  );
}
