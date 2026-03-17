# Brisbane Champions League Website

This site is built in the **Wide Banner + Tiles First** design.

## Main content locations

### 1) Teams and groups
Edit `data/teams.json`.
- `groups` controls the Group A / Group B headings.
- `teams` controls every team card.
- Update `name`, `group`, `city`, `homeGround`, `summary`, `primaryColor`, and `secondaryColor`.
- If you add a team logo, place it in `photos/teams/` using the team slug, for example `photos/teams/neapoleans.png`.

### 2) Points table / standings
Edit `data/points-table.json`.
- Each season lives inside `seasons`.
- Each season can have multiple `groups`.
- Update `position`, `played`, `won`, `lost`, `nr`, `points`, and `nrr`.
- The home page preview and the full points-table page both read from this file.

### 3) Fixtures and results
Edit `data/fixtures.json`.
- Add seasons under `seasons`.
- Each season contains `matches`.
- If a season has an empty `matches` array, the fixtures page will show **No matches scheduled**.
- The fixtures page automatically shows a season dropdown.

Suggested match fields:
- `date`
- `time`
- `stage`
- `venue`
- `homeTeam`
- `awayTeam`
- `homeScore`
- `awayScore`
- `status`
- `result`
- `streamUrl`
- `matchCentreUrl`

### 4) Homepage wide banner image
The main banner image is controlled from `data/site.json` under `homeImages.wideBanner`.

You can point it to:
- a remote URL, or
- a local image inside the project

The banner is styled with a locked aspect ratio so it stays balanced on large screens and mobile screens.

### 5) Homepage tile images
The Teams / Fixtures / Points Table tile images are controlled from `data/site.json` under `homeImages`:
- `teamsTile`
- `fixturesTile`
- `pointsTile`

You can point each one to a local file inside `assets/images/` or to an external image URL.

### 6) BCL and AMCC logos
Current logo files:
- `assets/images/bcl-logo.png`
- `assets/images/amcc-logo-white.png`

These versions are used in the header / footer for better visibility in the dark layout.
If you want to replace them, use similar proportions so the header layout stays balanced.

### 7) Gallery images
Gallery configuration lives in `data/gallery.json`.
By default it points to a folder.

To use folder-based gallery loading:
1. Put images in the configured folder, usually `photos/gallery/`
2. Run the gallery index script:

```bash
npm run build:gallery
```

That generates / updates `photos/gallery/index.json`.

### 8) News stories
News lives in `content/news/`.
- `content/news/index.json` controls story order.
- Individual stories are stored as separate JSON files.

To rebuild the news index:

```bash
npm run build:news
```

### 9) Sponsors
Edit `data/sponsors.json`.
Each sponsor supports:
- `name`
- `tier`
- `logo`
- `url`

## Design notes
- The site uses the **Option 4** layout everywhere.
- The layout is wider on large screens.
- The mobile layout has dedicated responsive rules for the header, hero, tiles, tables, cards, and footer.
- The stylesheet is fully replaced so older visual styles are not reused.

## Local preview
If you want to preview locally, open the site with a local web server.
For example:

```bash
python -m http.server
```

Then open the site in your browser.


## Homepage media and social buttons

The homepage wide banner and tile images are controlled from `data/site.json` under `homeImages`.

- `wideBanner`: main wide banner image URL
- `teamsTile`: Teams block image
- `fixturesTile`: Fixtures block image
- `pointsTile`: Points Table block image

The Facebook and WhatsApp buttons in the homepage banner are also controlled from `data/site.json` under `socialLinks` and `socialText`.

- `socialLinks.facebook`: Facebook page URL
- `socialLinks.whatsapp`: WhatsApp URL (for example a `wa.me` link)
- `socialText.facebook`: label text for the Facebook button
- `socialText.whatsapp`: label text for the WhatsApp button


Logo paths are editable in `data/site.json` under `logoPaths.bcl` and `logoPaths.amcc`.
