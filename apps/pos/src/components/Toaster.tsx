import { useToasts, type ToastTone } from "../stores/toast";

const TONE: Record<ToastTone, string> = {
  info: "border-surface-border bg-surface-panel text-slate-200",
  success: "border-verdant-500/50 bg-verdant-600/20 text-verdant-100",
  warn: "border-amber-500/50 bg-amber-500/15 text-amber-100",
  alert: "border-rose-500/60 bg-rose-600/20 text-rose-100",
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-left text-sm shadow-lg ${TONE[t.tone]}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
