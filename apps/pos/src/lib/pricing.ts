import { round2 } from "../data/ocm";
import type { OrderLine } from "../data/types";

export const EXCISE_RATE = 0.13; // NY adult-use ~13% combined excise + local
export const SALES_TAX_RATE = 0; // folded into excise for NY adult-use cannabis

export interface Totals {
  subtotal: number;
  discountAmount: number;
  excise: number;
  salesTax: number;
  total: number;
}

export function computeTotals(lines: OrderLine[], discountPct: number): Totals {
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const discountAmount = round2((subtotal * discountPct) / 100);
  const taxable = subtotal - discountAmount;
  const excise = round2(taxable * EXCISE_RATE);
  const salesTax = round2(taxable * SALES_TAX_RATE);
  const total = round2(taxable + excise + salesTax);
  return { subtotal, discountAmount, excise, salesTax, total };
}
