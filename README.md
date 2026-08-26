# The Absolute

An interactive, evidence-aware website dedicated to Lieutenant Colonel Wayne M. McDonnell's 9 June 1983 **Analysis and Assessment of Gateway Process**.

The product has three connected jobs:

1. **Decode the document** — explain all 29 scanned pages in plain English beside the original CIA Reading Room PDF.
2. **Translate the method** — guide a grounded six-stage attention and visualisation sequence based on the report's recurring exercises.
3. **Record what happens** — keep a private local field journal and pre-register predictions so experience, interpretation and outcome can be compared honestly.

## Current feature set

- responsive, dependency-free static website;
- searchable and filterable 29-page reader, each page condensed to one clear step plus a plain-English and evidence note;
- a single link to the original scanned PDF for anyone who wants the primary source, rather than a page-synced viewer;
- evidence labels separating grounded components, mixed extrapolations and speculative claims;
- browser speech synthesis for page summaries and optional guided practice;
- page progress stored locally;
- 6, 12 and 18-minute guided coherence sessions;
- body scan, head-to-toe circulation, expanded awareness, single-image patterning, release and return;
- private local session records with before/after focus scores;
- pre-registered signal experiments scored as hit, miss or ambiguous;
- JSON and CSV journal export;
- installable progressive web app with offline support for the site shell;
- GitHub Pages deployment workflow;
- reduced-motion, keyboard navigation and responsive layouts;
- explicit scientific, medical and independence safeguards.

## Run locally

The site has no build step.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

A local server is recommended because service workers and some PDF/browser features do not work correctly from a `file://` URL.

## Publish with GitHub Pages

After merging to `main`:

1. Open **Repository Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Run the `Deploy static site to Pages` workflow, or push another commit to `main`.

## Data and privacy

Practice settings, document progress, session records and experiments are stored only in the visitor's browser using `localStorage`. Nothing is sent to a server by this repository. Clearing site data removes the journal unless it has first been exported.

## Product position

The site treats the Gateway paper as a historically interesting assessment, not proof that:

- the universe is literally a holographic simulation;
- consciousness can reliably control external events;
- out-of-body travel or access to future information has been demonstrated;
- visualisation can diagnose or cure illness.

The practical core is presented as attention training, relaxation, imagery, reflection and testable personal experimentation. Claims remain attributed to the report.

## Primary source

CIA Reading Room document: `CIA-RDP96-00788R001700210016-5`. A copy is committed at `assets/source/gateway-process.pdf` and linked directly from the site; the CIA's own hosted copy is not required.

The site's own scan has a documented gap: the internal page numbering jumps from report page 24 to 26, with paragraph 34 cut off mid-sentence and paragraphs 35–36 absent. The `#missing-page` section on the site treats that as evidence to investigate rather than text to silently reconstruct. Any recovered version of the missing leaf should only be incorporated with documented provenance — source holder, original image, custody history, publication history and a confidence assessment; a transcription alone should not silently replace it.

## Next development phase

- locally hosted page images for a more reliable scan viewer;
- per-page modern research citations and bibliography cross-links;
- optional original narration and sound design with clear headphone safety;
- encrypted account sync as an opt-in alternative to local-only storage;
- automated accessibility, browser and performance tests;
- shareable, redacted experiment reports without exposing private journal content.
