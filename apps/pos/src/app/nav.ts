export interface TabDef {
  path: string;
  label: string;
  icon: string; // emoji glyph as a lightweight placeholder for an icon set
  group: "primary" | "support";
}

export const TABS: TabDef[] = [
  { path: "/gate", label: "Gate", icon: "🛂", group: "primary" },
  { path: "/sales", label: "Sales", icon: "🛒", group: "primary" },
  { path: "/customers", label: "Customers", icon: "👤", group: "primary" },
  { path: "/queue", label: "Queue", icon: "⏳", group: "primary" },
  { path: "/fulfillment", label: "Fulfill", icon: "🎒", group: "primary" },
  { path: "/orders", label: "Orders", icon: "📦", group: "primary" },
  { path: "/invoices", label: "Invoices", icon: "🧾", group: "primary" },
  { path: "/inventory", label: "Inventory", icon: "📊", group: "support" },
  { path: "/reports", label: "Reports", icon: "📈", group: "support" },
  { path: "/settings", label: "Settings", icon: "⚙️", group: "support" },
];
