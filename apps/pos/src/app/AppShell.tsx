import { Outlet } from "react-router-dom";
import { StatusBar } from "../components/StatusBar";
import { TabRail } from "../components/TabRail";

export function AppShell() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex min-h-0 flex-1">
        <TabRail />
        <main className="min-h-0 flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
