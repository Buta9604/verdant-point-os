import { TabScaffold } from "../components/TabScaffold";

export function CustomersTab() {
  return (
    <TabScaffold
      title="Customers"
      subtitle="Lookup, profiles, history, and loyalty."
      features={[
        "Search by name, phone, license # or scan ID",
        "Profile: contact, ID/age status + expiry, medical card",
        "Recreational vs medical status and limits",
        "Purchase history with reprint",
        "Lifetime / period purchase totals for limit tracking",
        "Quick-create from an ID scan (autofill from license)",
        "Loyalty points, tier, and redemption",
        "Compliance flags and notes (e.g. do-not-sell)",
      ]}
    />
  );
}
