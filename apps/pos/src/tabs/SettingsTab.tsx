import { TabScaffold } from "../components/TabScaffold";
import { useSession } from "../app/store";

export function SettingsTab() {
  const { online, setOnline } = useSession();
  return (
    <TabScaffold
      title="Settings"
      subtitle="Hardware, users, and store configuration."
      features={[
        "Pair & test: ID scanner, barcode scanner, receipt printer",
        "Cash drawer and card terminal pairing",
        "Users & roles (budtender / manager / admin) with PINs",
        "Permissions: refunds, discounts, voids, limit overrides",
        "Tax rules and purchase-limit configuration",
        "Receipt template and METRC credentials",
      ]}
      actions={
        <button
          onClick={() => setOnline(!online)}
          className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-300 hover:text-slate-100"
        >
          Simulate: go {online ? "offline" : "online"}
        </button>
      }
    />
  );
}
