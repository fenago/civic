import type { AdministrationBody, AdministrativeRegion, VoterInfo } from "../../shared/civic";
import { addressLines, tidy } from "../lib/format";
import { t } from "../strings";
import { ExternalLink } from "./ExternalLink";
import { SourceTag } from "./WhereToVote";

const LINK_ORDER = [
  "electionRegistrationUrl",
  "electionRegistrationConfirmationUrl",
  "absenteeVotingInfoUrl",
  "ballotInfoUrl",
  "electionRulesUrl",
  "votingLocationFinderUrl",
  "electionInfoUrl",
] as const;

export function ElectionOffice({ data }: { data: VoterInfo }) {
  const offices: { heading: string; region: AdministrativeRegion }[] = [];
  for (const state of data.state ?? []) {
    // Local first: it's usually the office a voter actually needs to call.
    if (state.local_jurisdiction?.electionAdministrationBody)
      offices.push({ heading: t.office.local, region: state.local_jurisdiction });
    if (state.electionAdministrationBody) offices.push({ heading: t.office.state, region: state });
  }

  return (
    <section className="space-y-4" aria-labelledby="office-title">
      <h2 id="office-title" className="text-xl font-bold">
        {t.office.title}
      </h2>
      {offices.length === 0 ? (
        <p className="card">{t.office.none}</p>
      ) : (
        offices.map(({ heading, region }) => (
          <OfficeCard key={heading} heading={heading} region={region} body={region.electionAdministrationBody!} />
        ))
      )}
    </section>
  );
}

function OfficeCard({ heading, region, body }: { heading: string; region: AdministrativeRegion; body: AdministrationBody }) {
  const physical = addressLines(body.physicalAddress);
  const mailing = addressLines(body.correspondenceAddress);
  const links = LINK_ORDER.filter((k) => body[k]);
  return (
    <div className="card space-y-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{heading}</p>
        <h3 className="text-lg font-semibold">{tidy(body.name) || tidy(region.name)}</h3>
        {body.name && region.name && <p className="text-slate-700">{tidy(region.name)}</p>}
      </div>

      {links.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {links.map((k) => (
            <li key={k}>
              <ExternalLink href={body[k]} className="btn-secondary w-full">
                {t.office.links[k]}
              </ExternalLink>
            </li>
          ))}
        </ul>
      )}

      {body.hoursOfOperation && (
        <div>
          <p className="font-semibold">{t.office.hours}</p>
          <p className="whitespace-pre-line">{body.hoursOfOperation}</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {physical.length > 0 && <AddressBlock label={t.office.physical} lines={physical} />}
        {mailing.length > 0 && mailing.join() !== physical.join() && <AddressBlock label={t.office.mailing} lines={mailing} />}
      </div>

      {!!body.electionOfficials?.length && (
        <div>
          <p className="font-semibold">{t.office.officials}</p>
          <ul className="mt-1 space-y-2">
            {body.electionOfficials.map((o, i) => (
              <li key={i} className="rounded-lg border border-slate-200 p-3">
                {o.name && <p className="font-medium">{o.name}</p>}
                {o.title && <p className="text-sm text-slate-700">{o.title}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.officePhoneNumber && (
                    <a className="btn-secondary" href={`tel:${o.officePhoneNumber.replace(/[^\d+]/g, "")}`}>
                      {t.office.call} {o.officePhoneNumber}
                    </a>
                  )}
                  {o.emailAddress && (
                    <a className="btn-secondary" href={`mailto:${o.emailAddress}`}>
                      {t.office.emailAction} {o.emailAddress}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SourceTag sources={region.sources} />
    </div>
  );
}

function AddressBlock({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <address className="not-italic">
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </address>
    </div>
  );
}
