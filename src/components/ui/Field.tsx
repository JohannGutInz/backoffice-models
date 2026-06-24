export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">{children}</dl>;
}

export function Field({ label, value }: { label: React.ReactNode; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-800">{value ?? "—"}</dd>
    </div>
  );
}
