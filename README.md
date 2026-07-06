# CapLink Studio

CapLink Group's internal creative tools, served as one GitHub Pages site
with a branded dashboard. Live at `https://laramendoza-clg.github.io/CLG/`.

## Structure

```
/                      dashboard (index.html) — tools grouped by category
/agendas/              index of the team's live agenda documents
/agenda-generator/     agenda BUILDER (Slides-like click-to-edit, publish)
/agenda/               agenda VIEWER (share link: /agenda/?e=<slug>)
/agenda/render.js      shared deck renderer used by builder and viewer
/dubai-pcs-card/       "I'm Attending" social card generator (Dubai PCS 2026)
/speaker-card/         Speaker & Panel social card generator (Dubai PCS 2026)
/sponsor-generator/    event-page sponsor section generator (embeddable code)
/logo-sizes/           sponsor logo size reference dictionary
/assets/               shared brand assets (logos, skylines: Dubai/NY/London)
```

## The agenda system

- Agenda content lives in **Supabase** (project `caplink-studio`): table
  `agendas` (public read; writes only via the `publish_agenda` RPC, which is
  gated by a team password stored in `studio_secrets`). An optional
  `presence` table powers "who's editing" avatars in the builder.
- The **builder** (`/agenda-generator/?e=<slug>`) loads the newest published
  version, autosaves locally while editing, and *Publish* makes it live.
  Text is edited by clicking it on the page; photos/logos by clicking them.
- The **viewer** (`/agenda/?e=<slug>`) always fetches the latest published
  version and prints to true 8.5×11 via Download PDF.
- Pages are US-Letter portrait (1000×1294). Session pages use balanced
  (typesetter-style) page breaks, fixed session spacing, and ruled "Notes"
  lines that absorb leftover space. Logos are always vertically centred;
  speaker photos are square-cornered.
- Known documents are listed in `/agendas/` (`KNOWN` array) — currently
  dubai-2026, newyork-2026, ai-data-breakfast-2026, europe-2027, mit-2026.
  Any newly published slug appears automatically.

## Notes

- All pages are `noindex` so they don't appear in search engines (unlisted).
- The card generators run fully client-side; uploaded photos never leave the
  device. The agenda tools talk only to Supabase; the sponsor generator loads
  fonts/logos from external URLs.
- `render.js` is loaded with a `?v=N` cache-buster (GitHub Pages caches for
  10 minutes); bump it in both `agenda/index.html` and
  `agenda-generator/index.html` whenever the renderer changes, and keep the
  small version badge in the builder header in sync.
