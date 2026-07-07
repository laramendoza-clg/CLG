# CapLink Studio — Project Handoff & Working Notes

**Read this first if you are a new Claude session (or teammate) picking up
this project.** It captures everything that lived in conversation with Lara
(Lara Mendoza, Head of Marketing & Design, CapLink Group) and is not obvious
from the code.

---

## 1. What this is

CapLink Studio (`https://laramendoza-clg.github.io/CLG/`) is CapLink Group's
internal tool suite, hosted on GitHub Pages from this repo (`main` branch =
live site, deployed via the mirror workflow — see rule 2). All pages are
`noindex` (unlisted, shared within CapLink only).

Structure is **event-first**: the dashboard (`/`) opens with a personal
"This week" deadlines panel + "Which event are you working on?" cards;
each event gets a workspace at `/event/?e=<slug>` (milestones timeline,
agenda links, website + social tools). A shared sticky nav
(`assets/studio-nav.js`, injected on every internal page, never on the
public agenda viewer) navigates by event. Cross-event admin lives at
`/backstage/` (quiet footer link only). Tools: agenda system (§3 — the
main project), social card generators (`/dubai-pcs-card/`,
`/speaker-card/`), sponsor-section generator, logo-size reference.
The Studio brand mark is Lara's logo (Squarespace URL, rendered white via
CSS filter on dark surfaces).

**The milestones system** (`assets/milestones.js`): ONE standard event
timeline (Doina's production draft, July 2026 + Lara's design/marketing
cadence), phases T-7 months → post-event, computed from each event's date
(`DATES` map; ids derive from labels so edits don't reset ticks). Every
item has a `track` (design/marketing/production/sales) — tracks are
DEFAULTS, not ownership: Lara's dashboard shows only design+marketing plus
per-item star/hide overrides (localStorage) and her own quick-added tasks;
the full timeline lives on event pages with an Everything/Just-mine
filter. Ticks are shared via Supabase `milestones` table, one-off tasks
via `tasks` table (both public-write like presence; localStorage fallback
if absent). The whole-team tracker deliberately does NOT live here —
that's for Bitrix; Lara owns only her lane.

## 2. Iron rules (established with Lara — do not violate)

1. **Documents are only changed by editing that document.** Template changes
   may restyle, but a *new field/capability must default to exactly the old
   behaviour* for documents that predate it. (We broke this once with the
   cover lockup; the fix pattern is in `lockupHtml()` in `agenda/render.js`.)
2. **Cache-bust on every renderer change:** bump `render.js?v=N` in BOTH
   `agenda/index.html` and `agenda-generator/index.html`, and the `v N` badge
   in the builder header. GitHub Pages caches for 10 min; without the bump
   Lara tests stale code and both sides get confused.
   **Deploys:** the Pages SOURCE branch is
   `claude/phone-functionality-content-r7yc0s` (changing it needs repo-admin
   rights nobody's token has). `.github/workflows/pages.yml` mirrors every
   push to `main` onto that branch and requests a Pages build — check the
   "Deploy site" run in the Actions tab is green; if the live site is stale,
   that's where to look first (in July 2026 the site silently froze for 2h
   because main moved and the source branch didn't).
3. **Logos are always vertically centred, never top-aligned** — everywhere.
4. **Speaker photos are square-cornered** (no border-radius). Lara's
   headshots are square; any cropping/rounding looks bad.
5. **One accent colour per event** (theme system), never mixed.
6. **Never put internal notes in public documents** (e.g. candidate-firm
   sourcing lists stay out of published agendas).
7. **The team publish password is never shared in chat or committed.** Lara
   has it; publishing is deliberately a human step.
8. Agenda pages default to **US Letter (8.5×11) portrait**; per-document
   `meta.orient:"landscape"` switches that document to **LEGAL landscape
   (14×8.5)** — Nawshad's preference, MIT first (builder: Design & event
   details → Page orientation). Absent → portrait, so existing documents
   never change. The footer must always be fully visible; leftover
   session-page space becomes ruled "Notes" lines (reserved on every page so
   page endings are identical); session spacing is fixed, page breaks are
   balanced (typesetter DP in `paginateSessions`). Landscape re-flows:
   welcome letter = ONE text column + signature rail on the right (two
   columns read badly — Lara vetoed), 5-up speaker/panelist grids, 3×2
   sponsor pages, 3-column closing directory.
9. **The document closes with ONE page** (v32 design): light editorial
   contact page — accent bar + "For further information, / please contact:"
   headline (editable: `meta.closingHead1/2`), airy two-column directory,
   and a full-height skyline photo rail on the right carrying the stacked
   CapLink logo + website. Optional `meta.backCover: true` adds a full-photo
   back cover after it (builder checkbox; absent → none).
10. **Reception (cocktail) pages are special:** no Notes lines; the card shows
   Venue/Experience left + a venue photo right (`sessions[i].img`); the
   thank-you renders as a separate ivory "A Note of Thanks" card that
   stretches to fill the page (legacy "Thank You" columns fold into it).

## 3. The agenda system (architecture)

- **Data**: Supabase project `caplink-studio`,
  URL `https://buijepdhgvcfmclztjez.supabase.co`, publishable key is in the
  page code (safe: public by design). Table `agendas(slug, data jsonb,
  updated_at)` — public read via RLS; writes ONLY via RPC
  `publish_agenda(p_slug,p_data,p_key)` which checks the team password in
  `studio_secrets`. Optional `presence` table powers live "who's editing"
  avatars (SQL was given to Lara — confirm it was run). `milestones`
  (id,done,by_name,at — confirmed run) and `tasks`
  (id,label,slug,due,done,by_name,at — given, unconfirmed) are public-write
  like presence and back the dashboard ticks / quick-add tasks.
- **Builder** `/agenda-generator/?e=<slug>`: loads newest published version;
  Google-Slides-style editing (click text on the page to type; click
  photos/logos for upload/URL/size popover; hover a session for
  move/add/delete; hover a panelist for ◂ ▸ reorder arrows; simple rows
  have "+ Turn into a panel"; curated speakers pages edit in place with
  hover-✕ remove and "+ Add person"). Undo/redo buttons + Ctrl/Cmd+Z /
  Shift+Z cover every mutation. Local drafts are **per event**
  (`caplink-agenda-builder-v3:<slug>` — one shared slot once caused NY
  content to nearly publish under the AI slug). **Publish** makes it live.
- **Viewer** `/agenda/?e=<slug>`: always fetches latest published version;
  flip with arrows/swipe; desktop defaults to a BOOK SPREAD (toggle in the
  bar, remembered per device); shows a version marker top-right. Download
  PDF renders in-page (html2canvas scale 3 ≈ 350dpi — scale 2 printed soft
  — into jsPDF at the document's paper size: letter portrait or legal
  landscape); the print-dialog fallback clones each page into a true
  paper-size box scaled via transform
  (NOT zoom — some print engines ignore it) and shows a tip about the
  browser's "Background graphics / Print backgrounds" checkbox, which no
  site CSS can force in Safari. The speakers page is ALWAYS exactly one
  page (list: 2→3 columns then shrink; grid: scales up OR down to fill).
- **Documents index** `/agendas/`: lists known events (KNOWN array) plus any
  published slug; Edit / View / Copy share link.
- **Seeds** `agenda/seeds/<slug>.json`: prepared content committed to the
  repo. The builder auto-loads a seed ONLY when an event has no published
  version. Once published, use Safety copies → "Load the full prepared
  draft" (replaces everything) or "Import only the speakers page from the
  draft" (touches nothing else — added after a full load wiped Lara's
  session-photo edits; prefer the surgical one).
- Shared renderer `agenda/render.js` (all layout lives here). Themes:
  dubai (petrol), european (plum), newyork (terracotta), london (navy/gold),
  boston (garnet #5E1A2E, for MIT). Backgrounds: `meta.bgImg` with presets
  Dubai / New York / London in `assets/`; cover lockup: `meta.lockImg`
  (image) or empty string → brand-style text lockup from city + event name;
  ABSENT field → legacy PCS image (rule #1).
- Back-compat optional fields (all default to legacy behaviour when absent):
  `meta.lockCity` (lockup left part, supports `\n` line breaks — e.g.
  "AI / DATA\n& INSIGHT"), `meta.speakersTitle` + `meta.speakersSub`
  (speakers-page badge/subtitle — used for "Past Speakers" pages),
  top-level `speakersList` (curated list replaces the session-derived one),
  `meta.welcome.sign2` ({img,name,title,org} — second signatory for
  co-hosted events, builder has add/remove), `meta.backCover`,
  `meta.closingHead1/2`. Mixed-case `meta.city` is respected in headers
  (all-caps still gets the classic Title-case treatment).
  JV events (CapLink × PE150): `meta.hostLabel/hostImg/hostH` put a
  "Hosted by" + JV lockup on the cover (also replaces the back-cover and
  closing-rail logos); `meta.headImg/headH` swap the interior header mark.
  One-click toggle in the builder's Design section uses the official
  Squarespace "CapLink x PE150 - White and Orange" URL.

## 4. Event status (as of last session)

| Slug | Event | Status |
|---|---|---|
| dubai-2026 | Dubai PCS, Sep 15 2026, The Lana | **Published & edited by Lara** — venue photo for reception page still owed |
| newyork-2026 | NY PCS, Oct 14 2026, WELL& by Durst + Nasdaq | Seeded — needs review+publish; sponsor logos not hosted |
| europe-2027 | European PCS, Feb 2027, London | Seeded — venue conflict in source (The Londoner vs Rosewood), date has no day yet (milestones marked est.); past-speakers page possible now the feature exists but content wasn't re-transcribed |
| mit-2027 | Private Capital Talent Leadership Summit, Feb 24 2027, MIT Cambridge | Seed rebuilt from Doina's Feb-24 draft incl. Past Speakers page (13 names, 6 with photos reused from aidb); header drops "Boston" (city:"" + lockCity:"BOSTON"); the internal firm-sourcing list under Value Creation Spotlight was DELIBERATELY excluded (rule 6). **Official title order pending Nawshad** — Lara's logo may say "Talent Leadership Private Capital Summit" vs the documents' "Private Capital Talent Leadership Summit". Still TBC: venue building, sponsors, confirmed speakers, hosted logos (MIT/GeniusMesh/event), Boston background photo, ticketing/student rate |
| ai-data-breakfast-2026 | AI / Data & Insight Private Capital Breakfast, Nov 18 2026, The May Fair, London (JV with PE150) | Published by Lara (edited); seed has full content: JV "Hosted by" branding, two-signature welcome, Past Speakers photo grid (30 headshots extracted from her PDF in `assets/speakers/aidb/`), May Fair logo. Still missing: Exact Insight + past-sponsor logos, Aram Taghavi signature image; "Two platforms, one room" partnership page has no template page type (decision pending). NB: Jaimee Michaud's photo in the source PDF carries an Advent logo though she's listed at SPV Global — flagged to Lara |

## 5. Open items

**Waiting on Lara / team:**
- Nawshad: confirm MIT's official title order (Lara's logo may need redoing).
- Doina: react to the marketing/design additions in the standard timeline
  (print & staging designs T-2mo; orders placed + holding slides T-1mo);
  the team-wide tracker itself should live in Bitrix, not the Studio.
- Confirm the `presence` SQL was run; team **names + photos** for the
  presence picker. `milestones` SQL confirmed run; `tasks` SQL given but
  unconfirmed (tasks fall back to per-device silently until then).
- Assets owed: Dubai reception venue photo (High Society), NY reception
  photo (Nasdaq MarketSite), NY/AI sponsor logos, Aram Taghavi signature,
  MIT logos + Boston background, speaker headshot URLs for NY/Europe panels.
- Publish NY + Europe from their seeds.

**Deferred / possible:**
- "Two platforms, one room" partnership page type (AI/Data deck page 9).
- Weekly Monday email of Lara's This-week list; per-event assets/links box.
- Europe past-speakers page (feature exists; content needs re-transcribing).
- Real login (Cloudflare Access, `caplink-group.com`); currently
  unlisted-but-open by explicit choice.
- If PDF colour still fails with the print-dialog checkbox on: render pages
  to images client-side and build the PDF in-page (no print dialog).

## 6. Lara's design taste (hard-won — respect it)

Quiet luxury: typography, hairlines, alignment — **no boxes/cards**, no
clutter, nothing "done by a beginner". Big readable titles; generous but
*deliberate* spacing (no orphan white space — she will notice). Raleway
everywhere. Brand plum family + per-event accent. Contact info is
deliberately low-key (bottom of the closing page, v27+). When she says a
page "looks bad", propose a designed alternative, don't just nudge values.
Cover scrims: legible but never "night-time" — protect the text zones,
let the photo breathe between them (tuned v43).

The dashboard's design brief (implicit, don't restate it to her): it does
the remembering. One glance answers "what's next for me" — most urgent
first, direct Go links to where the work happens, one-click capture for
incoming requests, done things move aside but stay findable, and other
departments' work never lands in her lists.

## 7. Working with Lara / environment constraints

- Claude's cloud environment **cannot render a browser** and its network
  blocks Supabase, Netlify, Google etc. — verify by asking Lara for
  screenshots; she responds fast and tests thoroughly. Syntax-check JS with
  `node --check` before pushing.
- Another Claude session sometimes pushes to `main` (e.g. `/logo-sizes/`)
  — always `git pull --rebase origin main` before pushing.
- PDFs from Lara: read with the `pages` parameter; transcribe faithfully;
  flag source inconsistencies rather than silently fixing (but obvious
  typos: fix and tell her).
- Her working style: iterative screenshot-driven design rounds; be honest
  about causes of bugs; she values plain-language explanations (team is
  non-technical).

## 8. Starting a new chat

Tell the new session: *"Read HANDOFF.md and README.md in the repo, then
continue."* That plus the git history recovers everything durable. The
Supabase dashboard login is Lara's (via GitHub); the team publish password
is known only to the team.
