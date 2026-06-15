// OCM (NY Office of Cannabis Management) purchase limits and penny/nickel rounding.
// These values represent adult-use defaults and are configurable in Settings,
// where the backend would ultimately own them.

export type Meter = "flower" | "concentrate" | "none";

export interface CategoryRule {
  meter: Meter;
  limitLabel: string; // shown on the sales screen per OCM
}

// Adult-use NY: 3 oz (~85 g) cannabis flower + 24 g concentrated cannabis per visit.
export const METER_LIMITS: Record<Exclude<Meter, "none">, number> = {
  flower: 85, // grams
  concentrate: 24, // grams
};

export const METER_LABEL: Record<Exclude<Meter, "none">, string> = {
  flower: "Flower (3 oz / 85 g)",
  concentrate: "Concentrate (24 g)",
};

export const CATEGORY_RULES: Record<string, CategoryRule> = {
  Flower: { meter: "flower", limitLabel: "Counts toward 3 oz (85 g) flower limit" },
  "Pre-rolls": { meter: "flower", limitLabel: "Counts toward 3 oz (85 g) flower limit" },
  Vapes: { meter: "concentrate", limitLabel: "Counts toward 24 g concentrate limit" },
  Concentrates: { meter: "concentrate", limitLabel: "Counts toward 24 g concentrate limit" },
  Edibles: { meter: "concentrate", limitLabel: "Counts toward 24 g concentrate limit" },
  Topicals: { meter: "concentrate", limitLabel: "Counts toward 24 g concentrate limit" },
  Accessories: { meter: "none", limitLabel: "No OCM purchase limit" },
};

export function categoryRule(category: string): CategoryRule {
  return CATEGORY_RULES[category] ?? { meter: "none", limitLabel: "No OCM purchase limit" };
}

// ---- Penny / nickel rounding ------------------------------------------------

export type RoundingMode = "none" | "up" | "down" | "nearest";

export interface RoundingConfig {
  mode: RoundingMode;
  increment: number; // dollars, e.g. 0.05 for nearest nickel
}

export const DEFAULT_ROUNDING: RoundingConfig = { mode: "nearest", increment: 0.05 };

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Apply penny-elimination rounding. Example with increment 0.05 on $0.93:
 *   up -> 0.95, down -> 0.90, nearest -> 0.95.
 */
export function applyRounding(amount: number, cfg: RoundingConfig): number {
  if (cfg.mode === "none" || cfg.increment <= 0) return round2(amount);
  const q = amount / cfg.increment;
  let rounded: number;
  if (cfg.mode === "up") rounded = Math.ceil(q) * cfg.increment;
  else if (cfg.mode === "down") rounded = Math.floor(q) * cfg.increment;
  else rounded = Math.round(q) * cfg.increment;
  return round2(rounded);
}
