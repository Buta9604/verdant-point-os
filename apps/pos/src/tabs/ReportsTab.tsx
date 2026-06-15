import { TabScaffold } from "../components/TabScaffold";

export function ReportsTab() {
  return (
    <TabScaffold
      title="Reports"
      subtitle="Drawer, sales, and compliance reporting."
      features={[
        "Drawer: open/close shift, cash counts, payouts, Z-report",
        "Sales by day / budtender / category / product",
        "Gross, discounts, and taxes",
        "Compliance: sales near/over limits, ID-verification log",
        "METRC sync exceptions",
      ]}
    />
  );
}
