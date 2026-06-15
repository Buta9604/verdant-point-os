// Roles and permissions. The backend is the source of truth for these and syncs
// them to each POS; the defaults here represent what would arrive from that sync.

export type Role = "security" | "budtender" | "fulfillment" | "manager" | "admin";

export interface Permissions {
  canCheckIn: boolean; // operate the security gate
  canSell: boolean; // ring sales at a register
  canFulfill: boolean; // work the fulfillment screen
  canDiscount: boolean;
  maxDiscountPct: number;
  canRefund: boolean;
  canVoid: boolean;
  canOverrideLimit: boolean; // override OCM purchase limits
  canEditCustomer: boolean;
  canEditSettings: boolean;
}

export const ROLE_LABEL: Record<Role, string> = {
  security: "Security",
  budtender: "Budtender",
  fulfillment: "Fulfillment",
  manager: "Manager",
  admin: "Admin",
};

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permissions> = {
  security: {
    canCheckIn: true,
    canSell: false,
    canFulfill: false,
    canDiscount: false,
    maxDiscountPct: 0,
    canRefund: false,
    canVoid: false,
    canOverrideLimit: false,
    canEditCustomer: true,
    canEditSettings: false,
  },
  budtender: {
    canCheckIn: false,
    canSell: true,
    canFulfill: false,
    canDiscount: true,
    maxDiscountPct: 15,
    canRefund: false,
    canVoid: false,
    canOverrideLimit: false,
    canEditCustomer: true,
    canEditSettings: false,
  },
  fulfillment: {
    canCheckIn: false,
    canSell: false,
    canFulfill: true,
    canDiscount: false,
    maxDiscountPct: 0,
    canRefund: false,
    canVoid: false,
    canOverrideLimit: false,
    canEditCustomer: false,
    canEditSettings: false,
  },
  manager: {
    canCheckIn: true,
    canSell: true,
    canFulfill: true,
    canDiscount: true,
    maxDiscountPct: 50,
    canRefund: true,
    canVoid: true,
    canOverrideLimit: true,
    canEditCustomer: true,
    canEditSettings: true,
  },
  admin: {
    canCheckIn: true,
    canSell: true,
    canFulfill: true,
    canDiscount: true,
    maxDiscountPct: 100,
    canRefund: true,
    canVoid: true,
    canOverrideLimit: true,
    canEditCustomer: true,
    canEditSettings: true,
  },
};
