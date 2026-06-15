import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  features: string[];
  actions?: ReactNode;
}

/**
 * Structured placeholder for tabs whose full behavior is built in later phases.
 * It documents the planned feature set in-app so the shell is navigable and the
 * design intent is visible.
 */
export function TabScaffold({ title, subtitle, features, actions }: Props) {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        {actions}
      </div>
      <div className="panel p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Planned features
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-slate-300"
            >
              <span className="mt-0.5 text-verdant-400">▸</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
