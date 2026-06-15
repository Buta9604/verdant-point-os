// Domain types for the dispensary workflow.
import type { Role } from "../app/permissions";

export interface User {
  id: string;
  name: string;
  pin: string; // 4-digit; backend-owned in production
  role: Role;
  active: boolean;
}

export type CustomerType = "recreational" | "medical";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO date (YYYY-MM-DD)
  licenseNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  type: CustomerType;
  medicalCardNumber?: string;
  notes?: string;
  flags: string[];
  loyaltyPoints: number;
  createdAt: number;
  lastEntryAt: number | null; // updated each time security scans them in
}

export type QueueLane = "pickup" | "pos";
export type QueueStatus = "waiting" | "serving" | "done";

export interface QueueEntry {
  id: string;
  customerId: string;
  lane: QueueLane;
  status: QueueStatus;
  enteredAt: number;
  servedByTerminal?: string;
}

export type OrderStatus =
  | "sent_to_fulfillment"
  | "in_progress"
  | "ready"
  | "completed"
  | "refunded"
  | "voided";

export interface OrderLine {
  productId: string;
  name: string;
  category: string;
  qty: number;
  meterGrams: number; // per-unit grams toward the OCM meter
  price: number;
}

export interface Order {
  id: string;
  number: number;
  customerId: string;
  customerName: string;
  terminalId: string;
  terminalName: string;
  budtenderId: string;
  budtenderName: string;
  lines: OrderLine[];
  status: OrderStatus;
  createdAt: number;
  sentAt: number;
  readyAt: number | null;
  completedAt: number | null;
  refundedAt: number | null;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  excise: number;
  salesTax: number;
  total: number;
  roundedTotal: number;
  pointsRedeemed: number;
  redeemValue: number;
  pointsEarned: number;
  paymentMethod?: "cash" | "card" | "debit";
  acknowledgedByBudtender: boolean; // cleared until budtender sees the "ready" signal
}
