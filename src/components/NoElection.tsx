import { useEffect, useState } from "react";
import type { Election, StatusCode } from "../../shared/civic";
import { fetchElections } from "../lib/api";
import { longDate } from "../lib/format";
import { t } from "../strings";
import { DistrictList } from "./DistrictList";
import { OfficialHelp } from "./StatusMessage";

export function NoElection({
  address,
  code,
  onChangeAddress,
}: {
  address: string;
  code: StatusCode;
  onChangeAddress: () => void;
}) {
  const [elections, setElections] = useState<Election[] | null>(null);

  useEffect(() => {
    fetchElections()
      // Google's test elections (ids 2000 and 1001) aren't real; don't show them to voters.
      .then((r) => setElections(r.elections.filter((e) => !/test/i.test(e.name))))
      .catch(() => setElections([]));
  }, []);

  return (
    <>
      <section className="card space-y-3">
        <h2 tabIndex={-1} className="text-2xl font-bold">
          {t.noElection.title}
        </h2>
        <p className="text-slate-700">{code === "electionOver" ? t.status.electionOver : t.noElection.intro}</p>
        <p className="text-sm text-slate-700">{address}</p>
        <button type="button" className="btn-secondary" onClick={onChangeAddress}>
          {t.address.change}
        </button>
        <OfficialHelp />
      </section>
      <section className="card space-y-2">
        <h3 className="text-lg font-semibold">{t.noElection.listTitle}</h3>
        {elections === null ? (
          <p role="status">{t.common.loading}</p>
        ) : elections.length === 0 ? (
          <p>{t.noElection.listEmpty}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {elections.map((e) => (
              <li key={e.id}>
                {e.name}: {longDate(e.electionDay)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card space-y-2">
        <h3 className="text-lg font-semibold">{t.noElection.districtsTitle}</h3>
        <DistrictList address={address} />
      </section>
    </>
  );
}
