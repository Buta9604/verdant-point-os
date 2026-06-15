import { useState } from "react";
import { CustomerForm, type CustomerDraft } from "../components/CustomerForm";
import { ageFromDob, isExpired, SAMPLE_SCANS, type ScannedLicense } from "../data/license";
import { useData } from "../stores/data";
import { useToasts } from "../stores/toast";
import type { Customer, QueueLane } from "../data/types";

type Mode = "idle" | "denied" | "returning" | "new";

const blankDraft = (lic: ScannedLicense): CustomerDraft => ({
  firstName: lic.firstName,
  lastName: lic.lastName,
  dob: lic.dob,
  licenseNumber: lic.licenseNumber,
  address: lic.address,
  phone: "",
  email: "",
  type: "recreational",
  medicalCardNumber: "",
  notes: "",
});

export function GateTab() {
  const { findByLicense, createCustomer, updateCustomer, recordEntry, addToQueue, queue, customers } =
    useData();
  const push = useToasts((t) => t.push);

  const [scan, setScan] = useState<ScannedLicense | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [matched, setMatched] = useState<Customer | null>(null);
  const [editing, setEditing] = useState(false);

  function handleScan(lic: ScannedLicense) {
    setScan(lic);
    setEditing(false);
    const age = ageFromDob(lic.dob);
    if (age < 21) {
      setMode("denied");
      setMatched(null);
      return;
    }
    const found = findByLicense(lic.licenseNumber);
    if (found) {
      setMatched(found);
      setMode("returning");
    } else {
      setMatched(null);
      setMode("new");
    }
  }

  function reset() {
    setScan(null);
    setMode("idle");
    setMatched(null);
    setEditing(false);
  }

  function admit(customer: Customer, lane?: QueueLane) {
    recordEntry(customer.id);
    if (lane) addToQueue(customer.id, lane);
    push(
      lane
        ? `${customer.firstName} added to ${lane === "pickup" ? "Pickup" : "Direct POS"} queue`
        : `${customer.firstName} ${customer.lastName} let in`,
      "success",
    );
    reset();
  }

  function createAndAdmit(draft: CustomerDraft, lane?: QueueLane) {
    const c = createCustomer(draft);
    push(`Profile created for ${c.firstName} ${c.lastName}`, "success");
    admit(c, lane);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_22rem]">
      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-100">Security Gate</h1>
          <p className="text-sm text-slate-400">
            Scan each visitor's ID at the entrance. Under-21 is denied automatically.
          </p>
        </header>

        <div className="panel p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scan a license
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCANS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleScan(s.license)}
                className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-200 hover:border-verdant-500"
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            (Simulated PDF417 scans. A hardware scanner feeds the same parsed fields.)
          </p>
        </div>

        {mode === "idle" && (
          <div className="panel p-8 text-center text-slate-500">
            Waiting for a scan…
          </div>
        )}

        {mode === "denied" && scan && <DeniedCard scan={scan} onClear={reset} />}

        {mode === "returning" && matched && (
          <ReturningCard
            customer={matched}
            scan={scan!}
            editing={editing}
            onEdit={() => setEditing(true)}
            onSave={(d) => {
              updateCustomer(matched.id, d);
              setMatched({ ...matched, ...d });
              setEditing(false);
              push("Profile updated", "success");
            }}
            onCancelEdit={() => setEditing(false)}
            onLetIn={() => admit(matched)}
            onQueue={(lane) => admit(matched, lane)}
          />
        )}

        {mode === "new" && scan && (
          <NewCard
            scan={scan}
            onCreate={(d, lane) => createAndAdmit(d, lane)}
            onCancel={reset}
          />
        )}
      </section>

      <RecentEntries queue={queue} customers={customers} />
    </div>
  );
}

function ScanSummary({ scan }: { scan: ScannedLicense }) {
  const age = ageFromDob(scan.dob);
  const expired = isExpired(scan.expiry);
  return (
    <div className="mb-3 text-sm text-slate-300">
      <div className="text-lg font-semibold text-slate-100">
        {scan.firstName} {scan.lastName}
      </div>
      <div className="text-slate-400">
        DOB {scan.dob} · Age {age} · License {scan.licenseNumber}
      </div>
      {expired && <div className="text-amber-300">⚠ License expired ({scan.expiry})</div>}
    </div>
  );
}

function DeniedCard({ scan, onClear }: { scan: ScannedLicense; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-500/60 bg-rose-600/15 p-5">
      <div className="mb-1 text-sm font-bold uppercase tracking-wide text-rose-300">
        Entry denied — under 21
      </div>
      <ScanSummary scan={scan} />
      <p className="text-sm text-rose-200">
        Do not admit. No profile created. Age {ageFromDob(scan.dob)} is below the legal
        minimum of 21.
      </p>
      <button onClick={onClear} className="mt-3 rounded-lg border border-rose-400/50 px-4 py-2 text-sm text-rose-100">
        Clear
      </button>
    </div>
  );
}

function ReturningCard({
  customer,
  scan,
  editing,
  onEdit,
  onSave,
  onCancelEdit,
  onLetIn,
  onQueue,
}: {
  customer: Customer;
  scan: ScannedLicense;
  editing: boolean;
  onEdit: () => void;
  onSave: (d: CustomerDraft) => void;
  onCancelEdit: () => void;
  onLetIn: () => void;
  onQueue: (lane: QueueLane) => void;
}) {
  return (
    <div className="rounded-2xl border border-verdant-500/50 bg-verdant-600/10 p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-verdant-300">
        Returning customer ✓
        {customer.type === "medical" && (
          <span className="rounded-full bg-sky-600/30 px-2 py-0.5 text-xs text-sky-200">Medical</span>
        )}
      </div>
      <ScanSummary scan={scan} />
      <div className="mb-3 text-sm text-slate-400">
        Loyalty {customer.loyaltyPoints} pts ·{" "}
        {customer.lastEntryAt
          ? `Last visit ${new Date(customer.lastEntryAt).toLocaleDateString()}`
          : "First recorded visit"}
        {customer.flags.length > 0 && (
          <span className="ml-2 text-amber-300">⚑ {customer.flags.join(", ")}</span>
        )}
      </div>

      {editing ? (
        <div className="panel p-4">
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
            onSubmit={onSave}
            onCancel={onCancelEdit}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={onLetIn} className="btn-primary py-2 text-sm">
            Let in
          </button>
          <button onClick={() => onQueue("pickup")} className="rounded-lg bg-surface-panel px-4 py-2 text-sm text-slate-100 hover:bg-surface-border">
            Queue · Pickup
          </button>
          <button onClick={() => onQueue("pos")} className="rounded-lg bg-surface-panel px-4 py-2 text-sm text-slate-100 hover:bg-surface-border">
            Queue · Direct POS
          </button>
          <button onClick={onEdit} className="rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-300 hover:text-slate-100">
            Edit profile
          </button>
        </div>
      )}
    </div>
  );
}

function NewCard({
  scan,
  onCreate,
  onCancel,
}: {
  scan: ScannedLicense;
  onCreate: (d: CustomerDraft, lane?: QueueLane) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CustomerDraft>(blankDraft(scan));
  return (
    <div className="rounded-2xl border border-sky-500/50 bg-sky-600/10 p-5">
      <div className="mb-1 text-sm font-bold uppercase tracking-wide text-sky-300">
        New customer
      </div>
      <ScanSummary scan={scan} />
      <p className="mb-3 text-sm text-slate-400">
        Profile pre-filled from the license scan. Confirm details, then create and admit.
      </p>
      <div className="panel mb-3 p-4">
        <CustomerForm
          initial={draft}
          submitLabel="Save details"
          onSubmit={(d) => setDraft(d)}
          onCancel={onCancel}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onCreate(draft)} className="btn-primary py-2 text-sm">
          Create &amp; let in
        </button>
        <button onClick={() => onCreate(draft, "pickup")} className="rounded-lg bg-surface-panel px-4 py-2 text-sm text-slate-100 hover:bg-surface-border">
          Create &amp; queue · Pickup
        </button>
        <button onClick={() => onCreate(draft, "pos")} className="rounded-lg bg-surface-panel px-4 py-2 text-sm text-slate-100 hover:bg-surface-border">
          Create &amp; queue · Direct POS
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Tip: "Save details" above applies any edits before creating.
      </p>
    </div>
  );
}

function RecentEntries({
  queue,
  customers,
}: {
  queue: ReturnType<typeof useData.getState>["queue"];
  customers: Customer[];
}) {
  const byId = (id: string) => customers.find((c) => c.id === id);
  const recent = [...queue].sort((a, b) => b.enteredAt - a.enteredAt).slice(0, 12);
  return (
    <aside className="panel h-fit p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-300">In the queue</h2>
      {recent.length === 0 && <p className="text-sm text-slate-500">No one waiting.</p>}
      <ul className="space-y-2">
        {recent.map((q) => {
          const c = byId(q.customerId);
          return (
            <li key={q.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
              <span className="text-slate-200">
                {c ? `${c.firstName} ${c.lastName}` : "Unknown"}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${q.lane === "pickup" ? "bg-amber-500/20 text-amber-200" : "bg-verdant-600/30 text-verdant-200"}`}>
                {q.lane === "pickup" ? "Pickup" : "POS"}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
