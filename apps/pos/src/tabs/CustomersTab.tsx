import { useMemo, useState } from "react";
import { CustomerForm } from "../components/CustomerForm";
import { searchCustomers } from "../lib/customers";
import { printReceipt } from "../lib/print";
import { ageFromDob } from "../data/license";
import { useData } from "../stores/data";
import { useSession, usePermissions } from "../app/store";
import { useToasts } from "../stores/toast";
import type { Customer } from "../data/types";

export function CustomersTab() {
  const { customers, orders, updateCustomer } = useData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matches = useMemo(() => searchCustomers(customers, query), [customers, query]);
  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[20rem_1fr]">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-100">Customers</h1>
        <input
          autoFocus
          className="inp w-full"
          placeholder="Search name, phone, or license #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="space-y-2">
          {query && matches.length === 0 && (
            <p className="text-sm text-slate-500">No matches.</p>
          )}
          {matches.map(({ customer, mostRecentEntry }) => (
            <button
              key={customer.id}
              onClick={() => setSelectedId(customer.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedId === customer.id
                  ? "border-verdant-500 bg-verdant-600/10"
                  : "border-surface-border bg-surface hover:border-verdant-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-100">
                  {customer.firstName} {customer.lastName}
                </span>
                {mostRecentEntry && (
                  <span className="rounded-full bg-verdant-500 px-2 py-0.5 text-xs font-semibold text-surface">
                    Just entered
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                DOB {customer.dob} · {customer.licenseNumber}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        {selected ? (
          <CustomerProfile
            key={selected.id}
            customer={selected}
            orders={orders.filter((o) => o.customerId === selected.id)}
            onSave={(d) => updateCustomer(selected.id, d)}
          />
        ) : (
          <div className="panel flex h-64 items-center justify-center text-slate-500">
            Search and select a customer to view their profile.
          </div>
        )}
      </section>
    </div>
  );
}

function CustomerProfile({
  customer,
  orders,
  onSave,
}: {
  customer: Customer;
  orders: ReturnType<typeof useData.getState>["orders"];
  onSave: (d: Partial<Customer>) => void;
}) {
  const perms = usePermissions();
  const printers = useSession((s) => s.printers);
  const push = useToasts((t) => t.push);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="panel p-5">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Edit profile</h2>
        <CustomerForm
          initial={{
            firstName: customer.firstName,
            lastName: customer.lastName,
            dob: customer.dob,
            licenseNumber: customer.licenseNumber,
            address: customer.address,
            phone: customer.phone,
            email: customer.email,
            type: customer.type,
            medicalCardNumber: customer.medicalCardNumber,
            notes: customer.notes,
          }}
          submitLabel="Save changes"
          onSubmit={(d) => {
            onSave(d);
            setEditing(false);
            push("Customer updated", "success");
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-sm text-slate-400">
              Age {ageFromDob(customer.dob)} · {customer.type} · {customer.licenseNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-verdant-600/20 px-3 py-1 text-xs text-verdant-200">
              {customer.loyaltyPoints} pts
            </span>
            {perms.canEditCustomer && (
              <button onClick={() => setEditing(true)} className="rounded-lg border border-surface-border px-3 py-1 text-sm text-slate-300 hover:text-slate-100">
                Edit
              </button>
            )}
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Phone" value={customer.phone ?? "—"} />
          <Info label="Email" value={customer.email ?? "—"} />
          <Info label="Address" value={customer.address ?? "—"} />
          <Info
            label="Medical card"
            value={customer.medicalCardNumber ?? (customer.type === "medical" ? "—" : "n/a")}
          />
          <Info
            label="Last entry"
            value={customer.lastEntryAt ? new Date(customer.lastEntryAt).toLocaleString() : "—"}
          />
          <Info label="Notes" value={customer.notes ?? "—"} />
        </dl>
      </div>

      <div className="panel p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-300">
          Order history ({orders.length})
        </h3>
        {orders.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
        <ul className="space-y-2">
          {[...orders]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                <div>
                  <span className="text-slate-100">#{o.number}</span>
                  <span className="ml-2 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.lines.length} items ·{" "}
                    <span className="capitalize">{o.status.replace(/_/g, " ")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">${o.total.toFixed(2)}</span>
                  {o.status === "completed" && (
                    <button
                      onClick={() => {
                        printReceipt(o, printers.receipt);
                        push(`Reprinting invoice #${o.number}`, "info");
                      }}
                      className="rounded-md bg-surface-panel px-2.5 py-1 text-xs text-slate-200 hover:bg-surface-border"
                    >
                      Reprint
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
        {completed.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Lifetime spend: $
            {completed.reduce((s, o) => s + o.roundedTotal, 0).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}
