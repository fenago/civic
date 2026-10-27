import type { VoterInfo } from "../../shared/civic";
import { longDate, oneLineAddress } from "../lib/format";
import type { LatLng } from "../lib/geo";
import { TABS, type Tab, type UrlState } from "../lib/url-state";
import { t } from "../strings";
import { ElectionOffice } from "./ElectionOffice";
import { SampleBallot } from "./SampleBallot";
import { VotingPlan } from "./VotingPlan";
import { WhereToVote } from "./WhereToVote";

export function Results({
  data,
  url,
  setUrl,
  here,
  onChangeAddress,
}: {
  data: VoterInfo;
  url: UrlState;
  setUrl: (next: Partial<UrlState>, opts?: { replace?: boolean }) => void;
  here: LatLng | null;
  onChangeAddress: () => void;
}) {
  const election = data.election;
  const updated = data.fetchedAt
    ? new Date(data.fetchedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <>
      <section className="card space-y-2">
        <h1 tabIndex={-1} className="text-2xl font-bold">
          {election?.name ?? t.appName}
        </h1>
        {election?.electionDay && <p className="text-lg">{t.results.electionDay(longDate(election.electionDay))}</p>}
        <p className="text-slate-700">{oneLineAddress(data.normalizedInput) || url.address}</p>
        <div className="no-print flex flex-wrap items-center gap-3">
          <button type="button" className="link" onClick={onChangeAddress}>
            {t.address.change}
          </button>
        </div>
        <p className="rounded-lg bg-brand-light px-3 py-2 text-sm">
          {t.results.checkBack}
          {updated && <span className="block text-slate-700">{t.results.lastUpdated(updated)}</span>}
        </p>
      </section>

      <nav aria-label={t.tabs.label} className="no-print sticky top-0 z-[1000] -mx-4 bg-slate-50/95 px-4 py-2 backdrop-blur">
        <ul className="grid grid-cols-4 gap-1 rounded-xl bg-slate-200 p-1">
          {TABS.map((tab) => (
            <li key={tab}>
              <a
                href={`?${new URLSearchParams({ address: url.address, ...(url.electionId ? { electionId: url.electionId } : {}), tab })}`}
                aria-current={url.tab === tab ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setUrl({ tab: tab as Tab, measure: undefined });
                  window.scrollTo({ top: 0 });
                }}
                className={`flex min-h-[44px] items-center justify-center rounded-lg px-1 text-center text-sm font-semibold leading-tight ${
                  url.tab === tab ? "bg-white text-brand shadow" : "text-slate-700 hover:bg-white/60"
                }`}
              >
                {t.tabs[tab]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {url.tab === "vote" && <WhereToVote data={data} here={here} />}
      {url.tab === "ballot" && (
        <SampleBallot
          data={data}
          address={url.address}
          openMeasure={url.measure}
          onOpenMeasure={(key) => setUrl({ measure: key })}
        />
      )}
      {url.tab === "plan" && <VotingPlan data={data} here={here} />}
      {url.tab === "office" && <ElectionOffice data={data} />}
    </>
  );
}
