import { useState } from "react";
import { useSession } from "./store";
import { ROLE_LABEL } from "./permissions";
import { useData } from "../stores/data";
import type { User } from "../data/types";

export function LockScreen() {
  const login = useSession((s) => s.login);
  const terminalName = useSession((s) => s.terminalName);
  const users = useData((d) => d.users).filter((u) => u.active);

  const [selected, setSelected] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function press(digit: string) {
    if (!selected) return;
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === selected.pin) {
        login({ id: selected.id, name: selected.name, role: selected.role });
      } else {
        setError(true);
        setTimeout(() => setPin(""), 400);
      }
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-verdant-400">Verdant Point</h1>
          <p className="text-sm text-slate-500">{terminalName} · sign in to continue</p>
        </div>

        {!selected ? (
          <div className="panel p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Choose your account
            </p>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelected(u);
                    setPin("");
                  }}
                  className="rounded-xl border border-surface-border bg-surface px-3 py-3 text-left hover:border-verdant-500"
                >
                  <div className="text-sm font-semibold text-slate-100">{u.name}</div>
                  <div className="text-xs text-slate-500">{ROLE_LABEL[u.role]}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="panel p-5">
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold text-slate-100">{selected.name}</div>
              <div className="text-xs text-slate-500">Enter PIN</div>
            </div>
            <div className={`mb-4 flex justify-center gap-3 ${error ? "animate-pulse" : ""}`}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full border ${
                    pin.length > i
                      ? error
                        ? "border-rose-400 bg-rose-400"
                        : "border-verdant-400 bg-verdant-400"
                      : "border-surface-border"
                  }`}
                />
              ))}
            </div>
            <div className="mx-auto grid w-56 grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <PinKey key={d} label={d} onClick={() => press(d)} />
              ))}
              <PinKey label="←" onClick={() => setPin((p) => p.slice(0, -1))} />
              <PinKey label="0" onClick={() => press("0")} />
              <PinKey
                label="↺"
                onClick={() => {
                  setSelected(null);
                  setPin("");
                  setError(false);
                }}
              />
            </div>
            {error && (
              <p className="mt-3 text-center text-sm text-rose-300">Incorrect PIN</p>
            )}
            <p className="mt-4 text-center text-xs text-slate-600">
              Demo PINs — Jordan 1111 · Mia 2222 · Diego 3333 · Pat 9999 · Sam 4444 · Riley 5555
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PinKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-surface-panel py-4 text-lg font-semibold text-slate-100 hover:bg-surface-border"
    >
      {label}
    </button>
  );
}
