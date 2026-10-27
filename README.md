# Voter Guide

Free, nonpartisan voter guide: one address → where to vote, sample ballot, plain-English ballot measure summaries, a voting plan, and the election office. Built on the Google Civic Information API. See `docs/` for the PRD.

**Built:** every module in the PRD.

- v1.0: F0 address + election picker, F1 where to vote, F2 sample ballot, F3 measure explainer, F5 voting plan, F6 election office
- v1.1: F4 candidate pages, F7 districts tab, Spanish (toggle in the header; `?lang=es` links work too)
- v1.2: F8 current officeholders via BallotReady, **off by default** (see below)

## Deploy on Netlify

1. Netlify → Add new site → Import from GitHub → `fenago/civic`, branch `main`. Build settings come from `netlify.toml` (build `npm run build`, publish `dist`, functions in `netlify/functions`).
2. Site configuration → Environment variables:
   - `GOOGLE_CIVIC_API_KEY` (required)
   - `ANTHROPIC_API_KEY` (for measure summaries; without it the app still works and shows official text only)
   - F8 only, once you have a BallotReady agreement: `PARTNER_API_KEY` and `FEATURE_OFFICEHOLDERS=true`. Until both are set, the Districts tab links to USA.gov and Open States instead.
3. Deploy. In Google Cloud Console, restrict the Civic API key to the Civic Information API.

## Local development

```bash
npm install
cp .env.example .env   # add your keys
npm run dev            # app + /api functions at http://localhost:5173
npm test
```

`npm run dev` runs the Netlify Functions inside Vite, so the Netlify CLI isn't required. Google's test election (`electionId=2000`) works year-round, e.g. `/?address=340 Main St, Venice, CA 90291&electionId=2000`.

## How it works

- `netlify/functions/*`: thin proxies at `/api/elections`, `/api/voterinfo`, `/api/divisions`, `/api/explain`, `/api/officeholders`. Keys stay server-side; responses are cached at Netlify's CDN (voterinfo 1h, divisions 24h, AI summaries 24h shared by all voters). Rate-limited per IP. Addresses are never logged.
- `/api/explain` summarizes a measure with Claude only when officials published its text; it never summarizes a bare title.
- No database. The address lives in the URL; the plan and ballot marks live in the voter's browser.
- Strings live in `src/strings/en.ts` and `src/strings/es.ts`; the type system and a test make sure every English string has a Spanish one. Have a native speaker review `es.ts` before relying on it (PRD release criterion).
- Measure summaries are generated and cached separately per language.
- `/api/officeholders` sends BallotReady only OCD district IDs, never the address.
