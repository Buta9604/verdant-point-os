import { TabScaffold } from "../components/TabScaffold";

export function OrdersTab() {
  return (
    <TabScaffold
      title="Orders"
      subtitle="Online preorders, pickup, and fulfillment."
      features={[
        "Incoming orders with status: New → Picking → Ready → Picked up",
        "Pick / pack flow with stock checks and reservation",
        "Convert order into a Sales cart for ID-verify + tender",
        "Notify customer when ready",
        "Filter by status, fulfillment type, and time",
      ]}
    />
  );
}
