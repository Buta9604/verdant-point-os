import { create } from "zustand";

export interface Budtender {
  id: string;
  name: string;
  initials: string;
  role: "budtender" | "manager" | "admin";
}

export interface ActiveCustomer {
  id: string;
  name: string;
  ageVerified: boolean;
  type: "recreational" | "medical";
}

interface SessionState {
  storeName: string;
  registerId: string;
  budtender: Budtender;
  online: boolean;
  pendingSync: number;
  drawerOpen: boolean;
  activeCustomer: ActiveCustomer | null;
  setOnline: (online: boolean) => void;
  attachCustomer: (c: ActiveCustomer | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  storeName: "Verdant Point",
  registerId: "REG-01",
  budtender: { id: "u1", name: "Jordan Lee", initials: "JL", role: "budtender" },
  online: true,
  pendingSync: 0,
  drawerOpen: false,
  activeCustomer: null,
  setOnline: (online) => set({ online }),
  attachCustomer: (activeCustomer) => set({ activeCustomer }),
}));
