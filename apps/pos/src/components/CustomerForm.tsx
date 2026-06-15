import { useState } from "react";
import type { Customer, CustomerType } from "../data/types";

export type CustomerDraft = Pick<
  Customer,
  | "firstName"
  | "lastName"
  | "dob"
  | "licenseNumber"
  | "address"
  | "phone"
  | "email"
  | "type"
  | "medicalCardNumber"
  | "notes"
>;

interface Props {
  initial: CustomerDraft;
  submitLabel: string;
  onSubmit: (draft: CustomerDraft) => void;
  onCancel?: () => void;
}

export function CustomerForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [d, setD] = useState<CustomerDraft>(initial);
  const set = <K extends keyof CustomerDraft>(k: K, v: CustomerDraft[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(d);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <Field label="First name">
        <input className="inp" value={d.firstName} onChange={(e) => set("firstName", e.target.value)} required />
      </Field>
      <Field label="Last name">
        <input className="inp" value={d.lastName} onChange={(e) => set("lastName", e.target.value)} required />
      </Field>
      <Field label="Date of birth">
        <input type="date" className="inp" value={d.dob} onChange={(e) => set("dob", e.target.value)} required />
      </Field>
      <Field label="License #">
        <input className="inp" value={d.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} required />
      </Field>
      <Field label="Phone">
        <input className="inp" value={d.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Email">
        <input className="inp" value={d.email ?? ""} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Address" full>
        <input className="inp" value={d.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Customer type">
        <select
          className="inp"
          value={d.type}
          onChange={(e) => set("type", e.target.value as CustomerType)}
        >
          <option value="recreational">Recreational</option>
          <option value="medical">Medical</option>
        </select>
      </Field>
      <Field label="Medical card #">
        <input
          className="inp"
          value={d.medicalCardNumber ?? ""}
          onChange={(e) => set("medicalCardNumber", e.target.value)}
          disabled={d.type !== "medical"}
        />
      </Field>
      <Field label="Notes" full>
        <textarea className="inp" rows={2} value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </Field>

      <div className="col-span-2 mt-1 flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-300 hover:text-slate-100">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary py-2 text-sm">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-slate-400 ${full ? "col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
