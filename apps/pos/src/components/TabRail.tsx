import { NavLink } from "react-router-dom";
import { TABS } from "../app/nav";

export function TabRail() {
  const primary = TABS.filter((t) => t.group === "primary");
  const support = TABS.filter((t) => t.group === "support");

  return (
    <nav className="flex w-20 shrink-0 flex-col items-stretch gap-1 border-r border-surface-border bg-surface-raised p-2">
      {primary.map((t) => (
        <TabItem key={t.path} path={t.path} label={t.label} icon={t.icon} />
      ))}
      <div className="my-1 border-t border-surface-border" />
      {support.map((t) => (
        <TabItem key={t.path} path={t.path} label={t.label} icon={t.icon} />
      ))}
    </nav>
  );
}

function TabItem({ path, label, icon }: { path: string; label: string; icon: string }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => `tab-link ${isActive ? "tab-link-active" : ""}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
