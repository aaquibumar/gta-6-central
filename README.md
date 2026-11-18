# GTA 6 Central

A static, responsive fan-made GTA VI companion website designed for free GitHub Pages hosting.

## Features

- Searchable cheat-code tracker with category filters and evidence/status labels.
- Leonida destination explorer for six places featured on Rockstar's official site.
- Character database using concise summaries linked to Rockstar’s official character page.
- Vehicle index with editable image URLs and fields for tested specifications.
- Tips, tricks, mission framework and Easter egg/discovery tracker.
- Scheduled GTA VI news discovery feed through GitHub Actions.
- Local browser content admin with JSON import/export.
- PWA manifest and service-worker caching for repeat visits.

## Run locally

For best results, serve this folder from a local web server (the browser's `fetch()` API may block JSON files when opened as `file://`).

With Python installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish free with GitHub Pages

1. Create a public GitHub repository named `gta-6-central` (or another name you prefer).
2. Upload the contents of this folder to the repository root. Keep `.github`, `assets`, `data`, and `scripts`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages deployment to finish. Your public address will be shown in the Pages settings.

The site is static and requires no paid hosting, API key, database or build step.

## Automatic news refresh

`.github/workflows/update-news.yml` runs every six hours and can also be started manually from the repository's **Actions** tab. `scripts/update-news.py` reads Google News RSS, keeps articles from an explicit publisher allow-list, and updates `data/news.json`.

The feed is a discovery digest, not an endorsement or fact-check. News items retain their publisher attribution and link; check source content before treating a claim as confirmed. If GitHub blocks workflow pushes, check **Settings → Actions → General → Workflow permissions** and allow read/write repository permissions.

## Content admin

Open `admin.html` on the deployed site. You can add records, import/export JSON and save a local draft.

**Important:** GitHub Pages cannot securely process admin logins or server-side writes. The admin panel is intentionally a local content editor, not a secure multi-user CMS. To publish edits to all visitors:

1. Export `content.json` from the admin page.
2. Replace `data/content.json` in the GitHub repository.
3. Commit the replacement. GitHub Pages will redeploy.

Do not put passwords, API secrets or private data in the admin page or repository. For secure accounts and direct online publishing, connect a proper CMS/backend later.

## Accuracy policy

- No cheat input is presented as working unless verified in the game.
- Pre-release vehicle sightings and names are not the same as tested in-game specifications.
- The Leonida region panel is a region index and is explicitly **not to scale**.
- Mission, reward, collectible and Easter egg entries remain labelled as pending until supported by gameplay evidence.
- News items show a date and publisher. Treat reports and rumours according to their original source.

## Sources used for initial factual entries

- Rockstar Games — Grand Theft Auto VI: https://www.rockstargames.com/VI
- Rockstar Games — Only in Leonida: https://www.rockstargames.com/VI/only-in-leonida
- Rockstar Games Newswire — Pre-load announcement: https://www.rockstargames.com/newswire/article/89834o94713o21/pre-load-grand-theft-auto-vi-now
- Community vehicle index (fan catalogue; treat pre-release labels as provisional): https://thegta6map.com/vehicles
- Community interactive map reference (not an official map): https://gtascoop.com/map/

## Legal

GTA 6 Central is an independent fan-made project and is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and related names and marks belong to their respective owners. Use official media only in line with its applicable terms and permissions.
