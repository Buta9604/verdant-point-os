import type { Customer } from "../data/types";

export interface CustomerMatch {
  customer: Customer;
  mostRecentEntry: boolean; // the one most recently scanned in by security
}

/**
 * Search customers by name / phone / license. Results are ordered so that when
 * several people share a name, whoever security scanned in most recently surfaces
 * first — and that top entrant is flagged so the budtender can recognize the
 * person standing in front of them.
 */
export function searchCustomers(customers: Customer[], query: string): CustomerMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = customers.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return (
      name.includes(q) ||
      c.licenseNumber.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  });

  matches.sort((a, b) => (b.lastEntryAt ?? 0) - (a.lastEntryAt ?? 0));

  // Flag the single most-recent entrant (within the last 4 hours) as the likely
  // person at the counter.
  const recentWindow = Date.now() - 4 * 60 * 60 * 1000;
  const top = matches[0];
  return matches.map((customer) => ({
    customer,
    mostRecentEntry:
      customer === top && customer.lastEntryAt != null && customer.lastEntryAt >= recentWindow,
  }));
}
