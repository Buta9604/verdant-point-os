import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { GateTab } from "../tabs/GateTab";
import { SalesTab } from "../tabs/SalesTab";
import { CustomersTab } from "../tabs/CustomersTab";
import { QueueTab } from "../tabs/QueueTab";
import { FulfillmentTab } from "../tabs/FulfillmentTab";
import { OrdersTab } from "../tabs/OrdersTab";
import { InvoicesTab } from "../tabs/InvoicesTab";
import { InventoryTab } from "../tabs/InventoryTab";
import { ReportsTab } from "../tabs/ReportsTab";
import { SettingsTab } from "../tabs/SettingsTab";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/sales" replace /> },
      { path: "gate", element: <GateTab /> },
      { path: "sales", element: <SalesTab /> },
      { path: "customers", element: <CustomersTab /> },
      { path: "queue", element: <QueueTab /> },
      { path: "fulfillment", element: <FulfillmentTab /> },
      { path: "orders", element: <OrdersTab /> },
      { path: "invoices", element: <InvoicesTab /> },
      { path: "inventory", element: <InventoryTab /> },
      { path: "reports", element: <ReportsTab /> },
      { path: "settings", element: <SettingsTab /> },
    ],
  },
]);
