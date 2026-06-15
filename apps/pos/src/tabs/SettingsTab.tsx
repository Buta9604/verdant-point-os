import {
  AVAILABLE_PRINTERS,
  useSession,
  type PrinterAssignments,
} from "../app/store";
import { ROLE_LABEL, type Role } from "../app/permissions";
import { useData } from "../stores/data";
import type { RoundingMode } from "../data/ocm";

const ROLES: Role[] = ["security", "budtender", "fulfillment", "manager", "admin"];

export function SettingsTab() {
  const session = useSession();
  const { rounding, setRounding, rolePermissions, setRolePermission } = useData();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400">
          Terminal identity and printers are per-station. Rounding and role
          permissions are owned by the backend and sync to every POS.
        </p>
      </header>

      {/* Terminal & user identity */}
      <section className="panel p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          This terminal
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Terminal name (prints on pick tickets)
            <input
              className="inp"
              value={session.terminalName}
              onChange={(e) => session.setTerminal(session.terminalId, e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-1 text-xs text-slate-400">
            Signed-in user
            <div className="inp flex items-center justify-between">
              <span className="text-slate-100">
                {session.currentUser?.name}
                <span className="ml-2 text-slate-500">
                  {session.currentUser ? ROLE_LABEL[session.currentUser.role] : ""}
                </span>
              </span>
              <button
                onClick={session.logout}
                className="rounded-md border border-surface-border px-2 py-0.5 text-xs text-slate-300 hover:text-slate-100"
              >
                Lock / switch
              </button>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Connection
            <button
              onClick={() => session.setOnline(!session.online)}
              className="inp text-left"
            >
              {session.online ? "Online — click to simulate offline" : "Offline — click to go online"}
            </button>
          </label>
        </div>
      </section>

      {/* Printers */}
      <section className="panel p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Printer routing
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["receipt", "Receipts"],
              ["pickTicket", "Pick tickets"],
              ["label", "Labels"],
            ] as [keyof PrinterAssignments, string][]
          ).map(([slot, label]) => (
            <label key={slot} className="flex flex-col gap-1 text-xs text-slate-400">
              {label}
              <select
                className="inp"
                value={session.printers[slot]}
                onChange={(e) => session.setPrinter(slot, e.target.value)}
              >
                {AVAILABLE_PRINTERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      {/* Rounding */}
      <section className="panel p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cash rounding (penny elimination)
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Mode
            <select
              className="inp"
              value={rounding.mode}
              onChange={(e) =>
                setRounding({ ...rounding, mode: e.target.value as RoundingMode })
              }
            >
              <option value="none">No rounding</option>
              <option value="up">Round up</option>
              <option value="down">Round down</option>
              <option value="nearest">Nearest</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Increment
            <select
              className="inp"
              value={rounding.increment}
              onChange={(e) =>
                setRounding({ ...rounding, increment: Number(e.target.value) })
              }
            >
              <option value={0.05}>Nearest $0.05 (nickel)</option>
              <option value={0.1}>Nearest $0.10</option>
              <option value={0.25}>Nearest $0.25</option>
            </select>
          </label>
          <p className="text-xs text-slate-500">
            Example: $0.93 →{" "}
            <span className="text-slate-300">
              {rounding.mode === "up"
                ? "$0.95"
                : rounding.mode === "down"
                  ? "$0.90"
                  : rounding.mode === "nearest"
                    ? "$0.95"
                    : "$0.93"}
            </span>{" "}
            (applied to cash totals only)
          </p>
        </div>
      </section>

      {/* Role permissions */}
      <section className="panel p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Role permissions
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          The backend is the source of truth; these toggles represent the synced
          config so you can see the restrictions enforced across the POS.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-1 pr-4">Role</th>
                <th className="px-2">Sell</th>
                <th className="px-2">Discount</th>
                <th className="px-2">Max %</th>
                <th className="px-2">Refund</th>
                <th className="px-2">Void</th>
                <th className="px-2">Override limit</th>
                <th className="px-2">Edit settings</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => {
                const p = rolePermissions[r];
                return (
                  <tr key={r} className="border-t border-surface-border">
                    <td className="py-2 pr-4 text-slate-200">{ROLE_LABEL[r]}</td>
                    <Toggle on={p.canSell} onClick={() => setRolePermission(r, { canSell: !p.canSell })} />
                    <Toggle on={p.canDiscount} onClick={() => setRolePermission(r, { canDiscount: !p.canDiscount })} />
                    <td className="px-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.maxDiscountPct}
                        onChange={(e) => setRolePermission(r, { maxDiscountPct: Number(e.target.value) })}
                        className="inp w-16 text-right"
                      />
                    </td>
                    <Toggle on={p.canRefund} onClick={() => setRolePermission(r, { canRefund: !p.canRefund })} />
                    <Toggle on={p.canVoid} onClick={() => setRolePermission(r, { canVoid: !p.canVoid })} />
                    <Toggle on={p.canOverrideLimit} onClick={() => setRolePermission(r, { canOverrideLimit: !p.canOverrideLimit })} />
                    <Toggle on={p.canEditSettings} onClick={() => setRolePermission(r, { canEditSettings: !p.canEditSettings })} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <td className="px-2">
      <button
        onClick={onClick}
        className={`h-5 w-9 rounded-full transition-colors ${on ? "bg-verdant-500" : "bg-surface-border"}`}
        aria-pressed={on}
      >
        <span
          className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </td>
  );
}
