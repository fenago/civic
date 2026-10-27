import { t } from "../strings";
import { DistrictList } from "./DistrictList";

export function DistrictsTab({ address }: { address: string }) {
  return (
    <section className="space-y-3" aria-labelledby="districts-title">
      <h2 id="districts-title" className="text-xl font-bold">
        {t.districts.title}
      </h2>
      <p className="text-sm text-slate-700">{t.districts.yearRound}</p>
      <DistrictList address={address} />
    </section>
  );
}
