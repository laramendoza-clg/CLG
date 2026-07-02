# CapLink Studio

A small collection of browser-based generators for CapLink, served as one
GitHub Pages site with a dashboard landing page.

## Structure

```
/                      dashboard (index.html) — tools grouped by category
/dubai-pcs-card/       "I'm Attending" social card generator (Dubai PCS 2026)
/speaker-card/         Speaker & Panel social card generator (Dubai PCS 2026)
/sponsor-generator/    Event-page sponsor section generator (embeddable code)
/ticket-pricing/       Summit ticket rate-ladder embeds + checkout field text (NY & Dubai)
```

Each tool is a self-contained `index.html` in its own folder. To add a new
generator, drop a new folder with an `index.html` and add a card to the
matching category section in the dashboard.

## Notes

- All pages are `noindex` so they don't appear in search engines (unlisted).
- The card generators run fully client-side; uploaded photos never leave the
  device. The sponsor generator loads fonts/logos from external URLs.
