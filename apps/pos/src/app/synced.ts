import type { StateCreator } from "zustand";

// Zustand middleware that mirrors a store's *data* (non-function fields) across
// browser windows via BroadcastChannel and persists it to localStorage. This
// stands in for the real-time backend until Phase 2/11: open the POS in one
// window and Fulfillment in another and they stay in sync live.

const PREFIX = "verdant-point";

function dataOnly<T extends object>(state: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const key in state) {
    const value = (state as Record<string, unknown>)[key];
    if (typeof value !== "function") out[key] = value;
  }
  return out as Partial<T>;
}

export function synced<T extends object>(
  name: string,
  creator: StateCreator<T>,
): StateCreator<T> {
  return (set, get, api) => {
    const key = `${PREFIX}:${name}`;
    const channel =
      typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(key) : null;
    let applyingRemote = false;

    const persistAndBroadcast = () => {
      const data = dataOnly(get() as object);
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        /* storage may be unavailable; ignore */
      }
      if (channel && !applyingRemote) channel.postMessage(data);
    };

    const syncedSet: typeof set = (partial, replace) => {
      (set as (p: typeof partial, r?: typeof replace) => void)(partial, replace);
      persistAndBroadcast();
    };

    if (channel) {
      channel.onmessage = (event: MessageEvent) => {
        applyingRemote = true;
        (set as (p: Partial<T>, r?: false) => void)(event.data as Partial<T>, false);
        applyingRemote = false;
      };
    }

    const initial = creator(syncedSet, get, api);

    // Hydrate from localStorage after defaults are in place.
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as Partial<T>;
        queueMicrotask(() => {
          applyingRemote = true;
          (set as (p: Partial<T>, r?: false) => void)(data, false);
          applyingRemote = false;
        });
      }
    } catch {
      /* ignore corrupt persisted state */
    }

    return initial;
  };
}
