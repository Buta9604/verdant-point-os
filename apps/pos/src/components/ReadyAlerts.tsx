import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../app/store";
import { useData } from "../stores/data";
import { useToasts } from "../stores/toast";

function beep() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    /* audio not available */
  }
}

/**
 * Live "order ready" signal for the budtender. When Fulfillment marks an order
 * ready, the order's terminal gets an instant banner + chime (across windows via
 * the synced store).
 */
export function ReadyAlerts() {
  const terminalId = useSession((s) => s.terminalId);
  const orders = useData((d) => d.orders);
  const acknowledgeOrder = useData((d) => d.acknowledgeOrder);
  const push = useToasts((t) => t.push);
  const navigate = useNavigate();
  const alerted = useRef<Set<string>>(new Set());

  const ready = orders.filter(
    (o) => o.terminalId === terminalId && o.status === "ready" && !o.acknowledgedByBudtender,
  );

  useEffect(() => {
    for (const o of ready) {
      if (!alerted.current.has(o.id)) {
        alerted.current.add(o.id);
        beep();
        push(`Order #${o.number} for ${o.customerName} is READY for pickup`, "success");
      }
    }
  }, [ready, push]);

  if (ready.length === 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-3 bg-verdant-600 px-4 py-2 text-sm font-semibold text-surface">
      <span className="animate-pulse">●</span>
      <span>
        {ready.length} order{ready.length > 1 ? "s" : ""} ready for pickup —{" "}
        {ready.map((o) => `#${o.number}`).join(", ")}
      </span>
      <button
        onClick={() => {
          ready.forEach((o) => acknowledgeOrder(o.id));
          navigate("/sales");
        }}
        className="ml-auto rounded-lg bg-surface/20 px-3 py-1 text-surface hover:bg-surface/30"
      >
        Go tender →
      </button>
    </div>
  );
}
