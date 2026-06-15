import { create } from "zustand";
import { synced } from "../app/synced";
import type {
  Customer,
  Order,
  OrderLine,
  OrderStatus,
  QueueEntry,
  QueueLane,
  User,
} from "../data/types";
import { SEED_CUSTOMERS, SEED_USERS } from "../data/seed";
import { applyRounding, DEFAULT_ROUNDING, round2, type RoundingConfig } from "../data/ocm";
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
  budtenderId: string;
  budtenderName: string;
  lines: OrderLine[];
  discountPct: number;
}

// Loyalty config: earn 1 point per $1 spent; redeem in 100-point blocks worth $5.
export const POINTS_PER_DOLLAR = 1;
export const REDEEM_BLOCK = 100;
export const REDEEM_BLOCK_VALUE = 5;

interface DataState {
  users: User[];
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
  completeOrder: (
    id: string,
    paymentMethod: Order["paymentMethod"],
    pointsRedeemed?: number,
  ) => void;
  refundOrder: (id: string) => void;

  // config (backend-owned in production)
  setRounding: (cfg: RoundingConfig) => void;
  setRolePermission: (role: Role, patch: Partial<Permissions>) => void;
}

export const useData = create<DataState>(
  synced<DataState>("data", (set, get) => ({
    users: SEED_USERS,
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
        budtenderId: input.budtenderId,
        budtenderName: input.budtenderName,
        lines: input.lines,
        status: "sent_to_fulfillment",
        createdAt: Date.now(),
        sentAt: Date.now(),
        readyAt: null,
        completedAt: null,
        refundedAt: null,
        discountPct: input.discountPct,
        ...priced,
        roundedTotal: priced.total,
        pointsRedeemed: 0,
        redeemValue: 0,
        pointsEarned: 0,
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

    completeOrder: (id, paymentMethod, pointsRedeemed = 0) => {
      const order = get().orders.find((o) => o.id === id);
      if (!order) return;
      const customer = get().customers.find((c) => c.id === order.customerId);
      const redeemable = customer
        ? Math.min(pointsRedeemed, Math.floor(customer.loyaltyPoints / REDEEM_BLOCK) * REDEEM_BLOCK)
        : 0;
      const redeemValue = round2((redeemable / REDEEM_BLOCK) * REDEEM_BLOCK_VALUE);
      const netTotal = Math.max(0, round2(order.total - redeemValue));
      // Cash gets penny/nickel rounding; cards charge the exact net total.
      const roundedTotal = paymentMethod === "cash" ? applyRounding(netTotal, get().rounding) : netTotal;
      const pointsEarned = Math.floor(netTotal * POINTS_PER_DOLLAR);

      set({
        orders: get().orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "completed",
                completedAt: Date.now(),
                paymentMethod,
                pointsRedeemed: redeemable,
                redeemValue,
                pointsEarned,
                roundedTotal,
                acknowledgedByBudtender: true,
              }
            : o,
        ),
        customers: customer
          ? get().customers.map((c) =>
              c.id === customer.id
                ? { ...c, loyaltyPoints: c.loyaltyPoints - redeemable + pointsEarned }
                : c,
            )
          : get().customers,
      });
    },

    refundOrder: (id) => {
      const order = get().orders.find((o) => o.id === id);
      if (!order || order.status !== "completed") return;
      set({
        orders: get().orders.map((o) =>
          o.id === id ? { ...o, status: "refunded", refundedAt: Date.now() } : o,
        ),
        // Reverse loyalty: claw back earned points, return redeemed points.
        customers: get().customers.map((c) =>
          c.id === order.customerId
            ? {
                ...c,
                loyaltyPoints: c.loyaltyPoints - order.pointsEarned + order.pointsRedeemed,
              }
            : c,
        ),
      });
    },

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
