# CapLink Studio — Project Handoff & Working Notes

**Read this first if you are a new Claude session (or teammate) picking up
this project.** It captures everything that lived in conversation with Lara
(Lara Mendoza, Head of Marketing & Design, CapLink Group) and is not obvious
from the code.

---

## 1. What this is

CapLink Studio (`https://laramendoza-clg.github.io/CLG/`) is CapLink Group's
internal tool suite, hosted on GitHub Pages from this repo (`main` branch =
live site). All pages are `noindex` (unlisted, shared within CapLink only).

Tools: dashboard (`/`), social card generators (`/dubai-pcs-card/`,
`/speaker-card/`), sponsor-section generator (`/sponsor-generator/`),
logo-size reference (`/logo-sizes/`), and the **agenda system** — the main
ongoing project (see §3).

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
8. Agenda pages are **US Letter (8.5×11)** portrait; the footer must always
   be fully visible; leftover session-page space becomes ruled "Notes" lines
   (reserved on every page so page endings are identical); session spacing
   is fixed, page breaks are balanced (typesetter DP in `paginateSessions`).
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
  avatars (SQL was given to Lara — confirm it was run).
- **Builder** `/agenda-generator/?e=<slug>`: loads newest published version;
  Google-Slides-style editing (click text on the page to type; click
  photos/logos for upload/URL/size popover; hover a session for
  move/add/delete; hover a panelist for ◂ ▸ reorder arrows). Undo/redo
  buttons + Ctrl/Cmd+Z / Shift+Z cover every mutation. Autosaves locally;
  **Publish** makes it live.
- **Viewer** `/agenda/?e=<slug>`: always fetches latest published version;
  flip with arrows/swipe; desktop defaults to a BOOK SPREAD (cover alone,
  then facing pairs; toggle in the bar, remembered per device); Download PDF
  prints true 8.5×11. The Confirmed Speakers page is ALWAYS exactly one page
  (2→3 columns, then gentle scaling).
- **Documents index** `/agendas/`: lists known events (KNOWN array) plus any
  published slug; Edit / View / Copy share link.
- **Seeds** `agenda/seeds/<slug>.json`: prepared content committed to the
  repo. The builder auto-loads a seed when an event has no published version
  yet — so new-event content ships via git and Lara only reviews + publishes.
  Seeds are ignored once a cloud version exists.
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
| dubai-2026 | Dubai PCS, Sep 15 2026, The Lana | **Published & edited by Lara** |
| newyork-2026 | NY PCS, Oct 14 2026, WELL& by Durst + Nasdaq | Seeded — needs review+publish |
| europe-2027 | European PCS, Feb 2027, London | Seeded — venue conflict in source (The Londoner vs Rosewood), date has no day yet, past-speakers page intentionally omitted |
| mit-2027 | Private Capital Talent Leadership Summit, Feb 24 2027, MIT Cambridge | Seeded — welcome letter is Claude-drafted (needs Nawshad review); venue building TBC; no sponsors yet; speakers indicative only (NOT placed in sessions on purpose); needs a Boston/Cambridge background photo |
| ai-data-breakfast-2026 | AI / Data & Insight Private Capital Breakfast, Nov 18 2026, The May Fair Hotel, London (co-hosted with PE150) | Seeded from Lara's PDF — needs review+publish. Not represented: the "Two platforms, one room" partnership page (no template page type); PE150 logo, Exact Insight logo, Aram Taghavi signature image not hosted yet |

## 5. Open items

- AI/Data Breakfast: Lara to review + publish; still missing PE150 /
  Exact Insight / past-sponsor logos, Aram Taghavi signature image, and a
  decision on the partnership ("Two platforms, one room") page.
- Confirm the `presence` SQL was run; Lara to send **team names + photos**
  to pre-seed the presence picker (currently self-serve name/photo).
- Speaker headshot URLs → panels (Lara has them all); once photos are in,
  flip the speakers page to the **photo grid** style (Design section).
- MIT: venue line, sponsors, confirmed speakers, hosted logos (MIT,
  GeniusMesh, event logo), Boston background, ticketing/student rate.
- Possible future: "Past Speakers" page type (Europe deck had one; not built).
- Deferred: real login (Cloudflare Access, domain `caplink-group.com`);
  currently the site is unlisted-but-open by explicit choice.

## 6. Lara's design taste (hard-won — respect it)

Quiet luxury: typography, hairlines, alignment — **no boxes/cards**, no
clutter, nothing "done by a beginner". Big readable titles; generous but
*deliberate* spacing (no orphan white space — she will notice). Raleway
everywhere. Brand plum family + per-event accent. Contact info is
deliberately low-key (bottom of the closing page, v27+). When she says a
page "looks bad", propose a designed alternative, don't just nudge values.

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
