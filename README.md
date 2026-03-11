# Brisbane Champions League website

Production-ready static sports website for **Brisbane Champions League (BCL)** with an **AMCC section**, responsive layout, Cloudflare Pages support, JSON-driven content, folder-based news workflow, gallery loader, and a Cloudflare Function adapter for live cricket API connections.

## What is included

- Match centre-style homepage cards
- Fixtures + Results page
- Points table page
- Team page with league team cards
- Gallery page
- News listing + news detail pages
- AMCC section
- Sponsor section
- Cloudflare Pages Function for live cricket API proxying
- Folder conventions for gallery photos, team logos and news files

## Folder structure

```text
assets/
  css/
  js/
  images/
content/
  news/
data/
  teams.json
functions/
  api/
photos/
  gallery/
  teams/
scripts/
```

## Quick start locally

1. Install Node.js 20+
2. In this folder run:
   ```bash
   npm install
   npm run build:news
   npm run build:gallery
   npm run dev
   ```
3. Open the local URL printed by Wrangler

## How content works

### 1) League team cards
Edit:

```text
data/teams.json
```

Team logos go in:

```text
photos/teams/
```

Use the team slug as the filename, for example:

```text
brisbane-falcons.png
logan-lions.png
river-city-royals.webp
```

If no logo is uploaded, the UI shows an initials badge automatically.

### 2) Points table
Edit:

```text
data/points-table.json
```

### 3) Fixtures and results
Edit:

```text
data/fixtures.json
```

When your live integration is ready, update:

```text
data/site.json
```

Set:

```json
{
  "useLiveApi": true,
  "apiEndpoint": "/api/matches"
}
```

### 4) News CMS folder system
Create one JSON file per article inside:

```text
content/news/
```

Then run:

```bash
npm run build:news
```

This updates:

```text
content/news/index.json
```

### 5) Gallery auto-loader
Upload images into:

```text
photos/gallery/
```

Then run:

```bash
npm run build:gallery
```

This updates:

```text
data/gallery.json
```

## Cricket.com.au / API adapter setup

The site includes:

```text
functions/api/matches.js
```

This is a Cloudflare Pages Function that safely proxies requests to your upstream cricket feed so your credentials do not sit in browser JavaScript.

### Environment variables to set in Cloudflare

Create these in **Cloudflare Pages → Settings → Environment variables**:

- `CRICKET_API_BASE`
- `CRICKET_API_KEY`
- `CRICKET_API_BEARER`
- `CRICKET_API_TENANT`

Use whichever ones your provider requires. The function already supports these header patterns:

- `x-api-key`
- `Authorization: Bearer ...`
- `x-tenant-id`

If cricket.com.au gives you different requirements, change the headers in:

```text
functions/api/matches.js
```

## Step-by-step: host on Cloudflare Pages free using GitHub

### A. Create the GitHub repo
1. Create a new GitHub repository, for example `bcl-website`
2. Upload all files from this project into that repository
3. Commit and push

### B. Create the Cloudflare Pages project
1. Log in to Cloudflare
2. Open **Workers & Pages**
3. Click **Create application**
4. Choose **Pages**
5. Choose **Connect to Git**
6. Select your GitHub repository
7. For build settings use:
   - **Framework preset:** None
   - **Build command:** leave blank for static-only deploys, or use `npm run build:news && npm run build:gallery` if you want Cloudflare to rebuild indices on each deploy
   - **Build output directory:** `/`
8. Click **Save and Deploy**

### C. Add environment variables for live matches
1. Open your Pages project
2. Go to **Settings → Environment variables**
3. Add your cricket API credentials
4. Redeploy the project

### D. Turn on live API in the website
Edit `data/site.json` and set:

```json
{
  "useLiveApi": true,
  "apiEndpoint": "/api/matches"
}
```

Commit and push again.

### E. Optional custom domain
1. In Cloudflare Pages open **Custom domains**
2. Add your domain
3. Follow the DNS prompts
4. Cloudflare will provision SSL automatically
