import type { Election } from "../../shared/civic";
import { longDate } from "../lib/format";
import { t } from "../strings";

export function ElectionPicker({ elections, onPick }: { elections: Election[]; onPick: (id: string) => void }) {
  return (
    <section className="card space-y-3">
      <h2 tabIndex={-1} className="text-2xl font-bold">
        {t.pickElection.title}
      </h2>
      <p>{t.pickElection.intro}</p>
      <ul className="space-y-2">
        {elections.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              className="btn-secondary w-full flex-col items-start text-left"
              onClick={() => onPick(e.id)}
            >
              <span>{e.name}</span>
              <span className="text-sm font-normal text-slate-700">{longDate(e.electionDay)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
