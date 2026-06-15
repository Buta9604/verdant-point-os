import { Outlet } from "react-router-dom";
import { StatusBar } from "../components/StatusBar";
import { TabRail } from "../components/TabRail";
import { ReadyAlerts } from "../components/ReadyAlerts";
import { Toaster } from "../components/Toaster";

export function AppShell() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <ReadyAlerts />
      <div className="flex min-h-0 flex-1">
        <TabRail />
        <main className="min-h-0 flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
