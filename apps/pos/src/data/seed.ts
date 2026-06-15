import type { Customer, User } from "./types";

// Staff accounts. Each budtender signs in with their own PIN so every sale is
// attributed to them for performance reporting. Backend-owned in production.
export const SEED_USERS: User[] = [
  { id: "u-jordan", name: "Jordan Lee", pin: "1111", role: "budtender", active: true },
  { id: "u-mia", name: "Mia Chen", pin: "2222", role: "budtender", active: true },
  { id: "u-diego", name: "Diego Santos", pin: "3333", role: "budtender", active: true },
  { id: "u-pat", name: "Pat Morgan", pin: "9999", role: "manager", active: true },
  { id: "u-sam", name: "Sam Doyle", pin: "4444", role: "security", active: true },
  { id: "u-riley", name: "Riley Fox", pin: "5555", role: "fulfillment", active: true },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  strain?: "Indica" | "Sativa" | "Hybrid";
  thc: string;
  price: number;
  meterGrams: number; // grams toward the category's OCM meter
  sku: string;
}

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

// Two "John Carter" records intentionally collide to exercise same-name
// disambiguation in budtender search.
export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cust-aisha",
    firstName: "Aisha",
    lastName: "Khan",
    dob: "1995-04-12",
    licenseNumber: "NY-AK-1001",
    address: "44 Maple St, Albany, NY",
    phone: "518-555-0112",
    type: "recreational",
    flags: [],
    loyaltyPoints: 240,
    notes: "Prefers low-dose edibles.",
    createdAt: now - 120 * day,
    lastEntryAt: now - 6 * day,
  },
  {
    id: "cust-john-a",
    firstName: "John",
    lastName: "Carter",
    dob: "1990-07-02",
    licenseNumber: "NY-JC-2001",
    address: "9 Birch Ln, Troy, NY",
    phone: "518-555-0190",
    type: "recreational",
    flags: [],
    loyaltyPoints: 80,
    createdAt: now - 60 * day,
    lastEntryAt: now - 30 * day,
  },
  {
    id: "cust-john-b",
    firstName: "John",
    lastName: "Carter",
    dob: "1988-11-23",
    licenseNumber: "NY-JC-2002",
    address: "210 Cedar Ave, Schenectady, NY",
    phone: "518-555-0188",
    type: "medical",
    medicalCardNumber: "NYMED-44218",
    flags: [],
    loyaltyPoints: 510,
    createdAt: now - 200 * day,
    lastEntryAt: now - 90 * day,
  },
  {
    id: "cust-maria",
    firstName: "Maria",
    lastName: "Lopez",
    dob: "1985-09-09",
    licenseNumber: "NY-ML-3001",
    address: "12 Willow Way, Albany, NY",
    phone: "518-555-0133",
    type: "medical",
    medicalCardNumber: "NYMED-77810",
    flags: [],
    loyaltyPoints: 1020,
    createdAt: now - 300 * day,
    lastEntryAt: now - 2 * day,
  },
];

export const CATEGORIES = [
  "Flower",
  "Pre-rolls",
  "Vapes",
  "Edibles",
  "Concentrates",
  "Topicals",
  "Accessories",
];

export const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Blue Dream 3.5g", category: "Flower", strain: "Hybrid", thc: "22%", price: 35, meterGrams: 3.5, sku: "FL-BD-35" },
  { id: "p2", name: "Northern Lights 3.5g", category: "Flower", strain: "Indica", thc: "19%", price: 40, meterGrams: 3.5, sku: "FL-NL-35" },
  { id: "p3", name: "Sour Diesel 7g", category: "Flower", strain: "Sativa", thc: "24%", price: 65, meterGrams: 7, sku: "FL-SD-70" },
  { id: "p4", name: "Pre-roll Pack 5x0.5g", category: "Pre-rolls", strain: "Sativa", thc: "21%", price: 30, meterGrams: 2.5, sku: "PR-5PK" },
  { id: "p5", name: "Live Resin Cart 0.5g", category: "Vapes", strain: "Hybrid", thc: "85%", price: 45, meterGrams: 0.5, sku: "VP-LR-05" },
  { id: "p6", name: "Distillate Cart 1g", category: "Vapes", strain: "Indica", thc: "88%", price: 60, meterGrams: 1, sku: "VP-DS-10" },
  { id: "p7", name: "Live Rosin 1g", category: "Concentrates", strain: "Hybrid", thc: "78%", price: 70, meterGrams: 1, sku: "CN-RS-10" },
  { id: "p8", name: "Gummies 100mg", category: "Edibles", thc: "100mg", price: 20, meterGrams: 1, sku: "ED-GM-100" },
  { id: "p9", name: "Chocolate Bar 100mg", category: "Edibles", thc: "100mg", price: 22, meterGrams: 1, sku: "ED-CB-100" },
  { id: "p10", name: "Relief Balm 500mg", category: "Topicals", thc: "500mg", price: 38, meterGrams: 0.5, sku: "TP-BM-500" },
  { id: "p11", name: "Grinder", category: "Accessories", thc: "—", price: 15, meterGrams: 0, sku: "AC-GR" },
  { id: "p12", name: "Rolling Papers", category: "Accessories", thc: "—", price: 4, meterGrams: 0, sku: "AC-RP" },
];
