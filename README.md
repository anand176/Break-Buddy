# Break Buddy

Chrome extension + marketing site for **Break Buddy** — a cinematic screen-break tool for focused browsing.

## Repository structure

```
Break-Buddy/
├── extension/     Chrome extension (load unpacked in Chrome)
└── marketing/     Vite + React landing page
```

---

## Extension

**Path:** `extension/`

### Download from the marketing site

Run the marketing site (`npm run dev` or deploy `marketing/dist`). The **Download ZIP** button
serves `break-buddy-extension.zip`, rebuilt automatically before `dev` and `build`.

### Manual install (load unpacked)

1. Download and unzip `break-buddy-extension.zip` (or use the `extension/` folder directly)
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the unzipped `extension` folder

See [extension/README.md](extension/README.md) for setup and behavior.

---

## Marketing site

**Path:** `marketing/`

```bash
cd marketing
npm install
npm run dev
```

Build for production:

```bash
cd marketing
npm run build
```

---

## Deploy to Vercel

**Do not commit the ZIP.** It is generated automatically during `npm run build` from
`../extension/` via the `prebuild` script.

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Set **Root Directory** to `marketing`
3. Framework preset: **Vite** (or use the included `marketing/vercel.json`)
4. Deploy

On each deploy, Vercel runs `prebuild` → zips `extension/` → `public/break-buddy-extension.zip`
→ Vite copies it to `dist/` → **Download ZIP** works on the live site.

Ensure the full repo is connected (not just the `marketing` folder in isolation) so
`../extension` exists at build time.

---

## License

See [LICENSE](LICENSE).
