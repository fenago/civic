import { t } from "../strings";

export function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <section className="card space-y-3">
      <h1 tabIndex={-1} className="text-2xl font-bold">
        {t.privacy.title}
      </h1>
      {t.privacy.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <button type="button" className="btn-secondary" onClick={onBack}>
        {t.privacy.back}
      </button>
    </section>
  );
}
