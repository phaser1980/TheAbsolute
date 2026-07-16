# The Absolute

An interactive, evidence-aware exploration of Lieutenant Colonel Wayne M. McDonnell's 1983 **Analysis and Assessment of Gateway Process**.

## Foundation prototype

The first working version is deliberately dependency-free: open `index.html` directly or publish the repository with GitHub Pages.

It includes:

- a responsive, immersive landing experience;
- a 29-page document decoder with plain-English summaries;
- an evidence lens that distinguishes history, established concepts, metaphor and speculation;
- a six-stage guided coherence practice;
- intention and image-cue storage in the user's browser only;
- timed breathing, step navigation and deliberate return-to-normal grounding;
- accessibility and reduced-motion support;
- clear independence, medical and scientific disclaimers.

## Product structure

### 1. Document decoder

Each scanned page is treated as a distinct unit with four layers:

1. what the page says;
2. what it means in plain English;
3. what is supported, debated or speculative;
4. how its ideas translate into a safe attention or visualisation practice.

### 2. Practice lab

The practical sequence is:

1. silence the verbal narrator;
2. scan the body from head to toe;
3. visualise a circulating head-to-feet-to-head energy loop;
4. expand awareness to include body, room and surrounding space;
5. hold one clear image of a completed outcome;
6. release the image and deliberately return to ordinary orientation.

The site does **not** claim that the report proves reality is a hologram or simulation, that thoughts guarantee external outcomes, or that paranormal abilities are established.

## Run locally

No build step is required.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Suggested next phase

- add authenticated journals and timestamped experiment logs;
- add original-page image viewing beside each explanation;
- source modern scientific commentary for every page;
- add optional narrated sessions and licensed audio integrations;
- create a structured content layer rather than keeping page data inside `index.html`;
- add automated accessibility, HTML and browser tests.

## Primary source

CIA Reading Room document: `CIA-RDP96-00788R001700210016-5`.
