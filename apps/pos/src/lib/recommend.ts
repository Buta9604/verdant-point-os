import { SEED_PRODUCTS, type Product } from "../data/seed";
import type { Customer, Order, OrderLine } from "../data/types";

export interface Recommendation {
  product: Product;
  reason: string;
}

// Complementary categories: buying the key triggers a suggestion from the value.
const COMPLEMENTS: Record<string, string[]> = {
  Flower: ["Accessories"],
  "Pre-rolls": ["Accessories"],
  Vapes: ["Edibles"],
  Concentrates: ["Accessories"],
  Edibles: ["Vapes"],
};

/**
 * Suggest add-ons to lift basket size: the customer's usuals first, then
 * complements to what's already in the cart, then store best-sellers. Anything
 * already in the cart is excluded.
 */
export function recommend(
  cartLines: OrderLine[],
  customer: Customer | null,
  orders: Order[],
  limit = 4,
): Recommendation[] {
  const inCart = new Set(cartLines.map((l) => l.productId));
  const out: Recommendation[] = [];
  const taken = new Set<string>();

  const add = (p: Product | undefined, reason: string) => {
    if (!p || inCart.has(p.id) || taken.has(p.id)) return;
    taken.add(p.id);
    out.push({ product: p, reason });
  };

  const completed = orders.filter((o) => o.status === "completed");

  // 1) Customer's usuals (most-bought products in their own history).
  if (customer) {
    const counts = new Map<string, number>();
    for (const o of completed.filter((o) => o.customerId === customer.id))
      for (const l of o.lines) counts.set(l.productId, (counts.get(l.productId) ?? 0) + l.qty);
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([pid]) =>
        add(SEED_PRODUCTS.find((p) => p.id === pid), `${customer.firstName}'s usual`),
      );
  }

  // 2) Complements to current cart categories.
  for (const l of cartLines) {
    for (const cat of COMPLEMENTS[l.category] ?? []) {
      add(
        SEED_PRODUCTS.find((p) => p.category === cat),
        `Pairs with ${l.category.toLowerCase()}`,
      );
    }
  }

  // 3) Store best-sellers to fill remaining slots.
  const popularity = new Map<string, number>();
  for (const o of completed)
    for (const l of o.lines) popularity.set(l.productId, (popularity.get(l.productId) ?? 0) + l.qty);
  [...popularity.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([pid]) => add(SEED_PRODUCTS.find((p) => p.id === pid), "Popular pick"));

  // Fallback so the strip is never empty on a fresh store.
  for (const p of SEED_PRODUCTS) add(p, "Staff pick");

  return out.slice(0, limit);
}
