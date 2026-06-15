import { TabScaffold } from "../components/TabScaffold";

export function InventoryTab() {
  return (
    <TabScaffold
      title="Inventory"
      subtitle="Stock lookup, receiving, and counts."
      features={[
        "On-hand by SKU with package IDs, location, and lot",
        "Low-stock alerts",
        "Quick adjustments and receiving",
        "Cycle counts with reason codes and audit trail",
        "METRC package linkage per SKU / lot",
      ]}
    />
  );
}
