# MediPulse AI Pro

A non-diagnostic clinical record synthesis tool. Paste or upload a laboratory
report, and MediPulse extracts structured biomarkers, flags out-of-range values
and history conflicts, charts trends across visits, exports a clinical PDF, and
suggests which specialty to consult.

Built with React 18, TypeScript, Vite and Tailwind CSS. Everything runs in the
browser — there is no backend and no account.

> **Not a medical device.** MediPulse does not provide diagnoses, prescribe
> medications, or alter dosages. Every output requires review by a qualified
> physician.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

The app is fully functional straight away — no API key required. Load one of the
demo presets on the Intake tab and select **Process medical record**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run preview` | Serve the built bundle on :4173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm test` | Vitest unit tests |
| `npm run verify` | typecheck + lint + test + build |

## Bring your own API key

MediPulse ships with **no API key**. Open the settings control in the header and
choose a provider:

- **Offline / local only** (default) — no network calls at all. A regex parser
  extracts markers and a rule-based assistant answers questions. Every feature
  works.
- **Google Gemini** — paste a key from [Google AI Studio](https://aistudio.google.com/apikey).
- **OpenAI** — paste a key from the [OpenAI dashboard](https://platform.openai.com/api-keys).

Model IDs are configurable in the same dialog, so a deprecated model does not
require a redeploy.

### Default Gemini key via environment

To ship a deployment that starts on Gemini without asking visitors for a key,
set a build-time variable (see [`.env.example`](.env.example)):

```bash
cp .env.example .env
# then fill in
VITE_GEMINI_API_KEY=your-key
```

On Vercel, add the same name under **Project → Settings → Environment
Variables** and redeploy — Vite reads them at build time, so a change needs a
new build.

Rules of thumb:

- A first-time visitor starts on **Gemini** with the env key pre-filled. Once
  they save a different provider or key in Settings, their choice wins.
- **Forget stored key** switches that browser to offline and stays there on
  reload; the env default does not re-apply.
- `VITE_*` values are inlined into the public JS bundle. Treat the key as
  public and restrict it (HTTP referrer / quota) in Google AI Studio.

### How your key is handled

Your key is stored in this browser's `localStorage` and sent **directly from your
browser** to the provider you chose. It never reaches a MediPulse server —
there isn't one. Anyone with access to this browser profile can read it, so use
**Forget stored key** on a shared machine.

If an AI call fails for any reason — bad key, rate limit, network — MediPulse
falls back to the local regex engine and tells you. It never dead-ends.

## Your data

Processed records, the audit log and saved providers live in this browser's
`localStorage` under `medipulse_*` keys, unencrypted. Nothing is uploaded.
Uploaded PDFs are parsed locally and never leave the machine.

Because records can contain age, sex, symptoms, conditions, medications and lab
values, treat the browser profile as you would the paper report. **Clear all
data** on the Intake tab wipes everything.

The Clinician/Patient switcher is a **UI affordance, not a security boundary** —
it hides clinician-only controls, but all data remains in the browser either way.

## Deploying to Vercel

`vercel.json` is included with the SPA rewrite already configured.

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

Or import the repository at [vercel.com/new](https://vercel.com/new) — the Vite
preset is detected automatically. No environment variables are needed, by
design. Any static host works: build with `npm run build` and serve `dist/`
with a rewrite of all paths to `index.html`.

## Project structure

```
src/
  data/          Clinical presets, the 3-visit demo, sample specialists, specialty rules
  lib/           Pure logic — regex parser, AI clients, trend maths, care rules, PDF/JSON export
  state/         useReducer store, selectors, localStorage persistence with schema migration
  hooks/         Shared behaviour (synthesis orchestration, toasts, PDF export)
  components/    UI, split by tab: intake / record / trends / findcare / chat / settings
```

State lives in a single reducer. The audit log is *derived* from the action
stream rather than written by hand at each call site, so it is not possible to
change state without leaving an audit entry.

## Notes

- **The sample specialist directory is demo data.** Those names, ratings,
  distances and phone numbers are fictional. Use "Find real providers on Google
  Maps" to search actual clinicians.
- Location detection uses [Nominatim](https://operations.osmfoundation.org/policies/nominatim/),
  which asks for no more than one request per second. It only runs when you
  press the button, and falls back to raw coordinates if the lookup fails.
- The exported PDF is rasterised by `html2pdf.js`, so its text is not
  selectable. Replacing it with `jspdf-autotable` would produce a vector
  document; that is a worthwhile follow-up.
- PDF reading uses pdf.js with an **inlined worker** (Vite's `?worker&inline`),
  so the worker ships inside an ordinary app chunk and starts from a Blob URL.
  There is no standalone `.mjs` worker file to 404 or to be served with the
  wrong MIME type — the two ways this normally breaks in production but not in
  dev. If you add a Content-Security-Policy, it needs `worker-src 'self' blob:`.

## Licence

No licence has been specified for this repository.
