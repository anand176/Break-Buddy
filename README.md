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

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

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

## License

See [LICENSE](LICENSE).
