import { create } from "zustand";
import { useData } from "../stores/data";
import { ROLE_LABEL, type Permissions, type Role } from "./permissions";

export interface ActiveCustomer {
  id: string;
  name: string;
  ageVerified: boolean;
  type: "recreational" | "medical";
}

// Mock list of printers a station could route to. Real pairing happens via the
// hardware layer; here Settings maps logical roles -> a chosen printer.
export const AVAILABLE_PRINTERS = [
  "Front Receipt Printer",
  "Fulfillment Pick-Ticket Printer",
  "Label Printer",
] as const;

export interface PrinterAssignments {
  receipt: string;
  pickTicket: string;
  label: string;
}

interface SessionState {
  storeName: string;
  // Per-terminal identity. Each POS logs in as a specific terminal + user; the
  // terminal name (e.g. "Terminal 3") is printed on the fulfillment pick ticket.
  terminalId: string;
  terminalName: string;
  userName: string;
  role: Role;
  printers: PrinterAssignments;
  online: boolean;
  activeCustomer: ActiveCustomer | null;

  setOnline: (online: boolean) => void;
  attachCustomer: (c: ActiveCustomer | null) => void;
  setTerminal: (terminalId: string, terminalName: string) => void;
  setUser: (userName: string, role: Role) => void;
  setPrinter: (slot: keyof PrinterAssignments, printer: string) => void;
}

export const useSession = create<SessionState>((set) => ({
  storeName: "Verdant Point — Albany",
  terminalId: "T3",
  terminalName: "Terminal 3",
  userName: "Jordan Lee",
  role: "budtender",
  printers: {
    receipt: "Front Receipt Printer",
    pickTicket: "Fulfillment Pick-Ticket Printer",
    label: "Label Printer",
  },
  online: true,
  activeCustomer: null,

  setOnline: (online) => set({ online }),
  attachCustomer: (activeCustomer) => set({ activeCustomer }),
  setTerminal: (terminalId, terminalName) => set({ terminalId, terminalName }),
  setUser: (userName, role) => set({ userName, role }),
  setPrinter: (slot, printer) =>
    set((s) => ({ printers: { ...s.printers, [slot]: printer } })),
}));

export function roleLabel(role: Role): string {
  return ROLE_LABEL[role];
}

/** Effective permissions for the current user, sourced from backend-synced config. */
export function usePermissions(): Permissions {
  const role = useSession((s) => s.role);
  return useData((d) => d.rolePermissions[role]);
}
