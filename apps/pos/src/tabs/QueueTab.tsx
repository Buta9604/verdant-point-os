import { TabScaffold } from "../components/TabScaffold";

export function QueueTab() {
  return (
    <TabScaffold
      title="Queue"
      subtitle="Door check-in and live waiting room."
      features={[
        "Check-in by ID scan with age/ID pre-verification",
        "Live queue list over WebSocket (name, wait time, status)",
        "Recreational vs medical lanes",
        "Assign / claim a customer to a register",
        "Call customer → pre-attaches them to the Sales tab",
        "Express pickup vs full-service lanes",
        "Wait-time metrics for the floor manager",
      ]}
    />
  );
}
