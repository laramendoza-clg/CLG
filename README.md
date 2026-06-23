# CapLink Tools

A small collection of browser-based generators for CapLink, served as one
GitHub Pages site with a dashboard landing page.

## Structure

```
/                      dashboard (index.html) — links to each tool
/dubai-pcs-card/       "I'm Attending" card generator for Dubai PCS 2026
```

Each tool is a self-contained `index.html` in its own folder. To add a new
generator, drop a new folder with an `index.html` and add a card to the
dashboard.

## Notes

- All pages are `noindex` so they don't appear in search engines (unlisted).
- Everything runs client-side; uploaded headshots never leave the device.
