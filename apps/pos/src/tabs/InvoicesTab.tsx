import { TabScaffold } from "../components/TabScaffold";

export function InvoicesTab() {
  return (
    <TabScaffold
      title="Invoices"
      subtitle="Completed transactions, reprints, and refunds."
      features={[
        "Searchable ledger by date, budtender, customer, amount, tender",
        "Detail: line items, taxes, tender breakdown, compliance snapshot",
        "METRC sync status per transaction",
        "Reprint receipt / invoice; email or SMS a copy",
        "Refunds & returns (permissioned) with restock + METRC reversal",
        "Daily totals and CSV export",
      ]}
    />
  );
}
