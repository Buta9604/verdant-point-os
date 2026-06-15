import { create } from "zustand";
import { synced } from "../app/synced";
import type {
  Customer,
  Order,
  OrderLine,
  OrderStatus,
  QueueEntry,
  QueueLane,
} from "../data/types";
import { SEED_CUSTOMERS } from "../data/seed";
import { applyRounding, DEFAULT_ROUNDING, type RoundingConfig } from "../data/ocm";
import { computeTotals } from "../lib/pricing";
import {
  DEFAULT_ROLE_PERMISSIONS,
  type Permissions,
  type Role,
} from "../app/permissions";

const uid = () => Math.random().toString(36).slice(2, 10);

export interface NewOrderInput {
  customerId: string;
  customerName: string;
  terminalId: string;
  terminalName: string;
  budtenderName: string;
  lines: OrderLine[];
  discountPct: number;
}

interface DataState {
  customers: Customer[];
  queue: QueueEntry[];
  orders: Order[];
  orderCounter: number;
  rounding: RoundingConfig;
  rolePermissions: Record<Role, Permissions>;

  // customers
  findByLicense: (licenseNumber: string) => Customer | undefined;
  createCustomer: (c: Omit<Customer, "id" | "createdAt" | "lastEntryAt" | "flags" | "loyaltyPoints">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  recordEntry: (customerId: string) => void;

  // queue
  addToQueue: (customerId: string, lane: QueueLane) => void;
  setQueueStatus: (id: string, status: QueueEntry["status"], terminalId?: string) => void;
  removeFromQueue: (id: string) => void;

  // orders / fulfillment
  createOrder: (input: NewOrderInput) => Order;
  advanceOrder: (id: string, status: OrderStatus) => void;
  acknowledgeOrder: (id: string) => void;
  completeOrder: (id: string, paymentMethod: Order["paymentMethod"]) => void;

  // config (backend-owned in production)
  setRounding: (cfg: RoundingConfig) => void;
  setRolePermission: (role: Role, patch: Partial<Permissions>) => void;
}

export const useData = create<DataState>(
  synced<DataState>("data", (set, get) => ({
    customers: SEED_CUSTOMERS,
    queue: [],
    orders: [],
    orderCounter: 1001,
    rounding: DEFAULT_ROUNDING,
    rolePermissions: DEFAULT_ROLE_PERMISSIONS,

    findByLicense: (licenseNumber) =>
      get().customers.find(
        (c) => c.licenseNumber.toLowerCase() === licenseNumber.toLowerCase(),
      ),

    createCustomer: (c) => {
      const customer: Customer = {
        ...c,
        id: `cust-${uid()}`,
        flags: [],
        loyaltyPoints: 0,
        createdAt: Date.now(),
        lastEntryAt: null,
      };
      set({ customers: [...get().customers, customer] });
      return customer;
    },

    updateCustomer: (id, patch) =>
      set({
        customers: get().customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),

    recordEntry: (customerId) =>
      set({
        customers: get().customers.map((c) =>
          c.id === customerId ? { ...c, lastEntryAt: Date.now() } : c,
        ),
      }),

    addToQueue: (customerId, lane) => {
      const entry: QueueEntry = {
        id: `q-${uid()}`,
        customerId,
        lane,
        status: "waiting",
        enteredAt: Date.now(),
      };
      set({ queue: [...get().queue, entry] });
    },

    setQueueStatus: (id, status, terminalId) =>
      set({
        queue: get().queue.map((q) =>
          q.id === id ? { ...q, status, servedByTerminal: terminalId ?? q.servedByTerminal } : q,
        ),
      }),

    removeFromQueue: (id) => set({ queue: get().queue.filter((q) => q.id !== id) }),

    createOrder: (input) => {
      const number = get().orderCounter + 1;
      const priced = computeTotals(input.lines, input.discountPct);
      const order: Order = {
        id: `ord-${uid()}`,
        number,
        customerId: input.customerId,
        customerName: input.customerName,
        terminalId: input.terminalId,
        terminalName: input.terminalName,
        budtenderName: input.budtenderName,
        lines: input.lines,
        status: "sent_to_fulfillment",
        createdAt: Date.now(),
        sentAt: Date.now(),
        readyAt: null,
        completedAt: null,
        discountPct: input.discountPct,
        ...priced,
        roundedTotal: priced.total,
        acknowledgedByBudtender: true, // budtender just created it; not yet "ready"
      };
      set({ orders: [...get().orders, order], orderCounter: number });
      return order;
    },

    advanceOrder: (id, status) =>
      set({
        orders: get().orders.map((o) => {
          if (o.id !== id) return o;
          const patch: Partial<Order> = { status };
          if (status === "ready") {
            patch.readyAt = Date.now();
            patch.acknowledgedByBudtender = false; // fire the budtender signal
          }
          return { ...o, ...patch };
        }),
      }),

    acknowledgeOrder: (id) =>
      set({
        orders: get().orders.map((o) =>
          o.id === id ? { ...o, acknowledgedByBudtender: true } : o,
        ),
      }),

    completeOrder: (id, paymentMethod) =>
      set({
        orders: get().orders.map((o) => {
          if (o.id !== id) return o;
          const roundedTotal = applyRounding(o.total, get().rounding);
          return {
            ...o,
            status: "completed",
            completedAt: Date.now(),
            paymentMethod,
            roundedTotal,
            acknowledgedByBudtender: true,
          };
        }),
      }),

    setRounding: (rounding) => set({ rounding }),

    setRolePermission: (role, patch) =>
      set({
        rolePermissions: {
          ...get().rolePermissions,
          [role]: { ...get().rolePermissions[role], ...patch },
        },
      }),
  })),
);
