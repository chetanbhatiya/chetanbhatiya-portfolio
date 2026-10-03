# Chetan Bhatiya — Portfolio

A responsive, dark-first personal portfolio built with plain HTML, CSS, and JavaScript. It has no build step or backend and can be opened directly from `index.html`.

## Folder structure

```text
outputs/
├── index.html     Main portfolio and metadata
├── style.css      Layout, themes, previews, and responsive styles
├── script.js      Theme, navigation, scroll, filters, calculators, chart maker, and copy-email
├── favicon.svg    Lightweight custom favicon
├── 404.html       Friendly not-found page for GitHub Pages
└── README.md      Setup, deployment, and launch checklist
```

## Run locally

Open `index.html` in a modern browser. Google Fonts load online; if offline, the page falls back to system sans-serif fonts. All site functionality works without a backend. The GST and TDS calculators run in the browser, and the chart maker exports an SVG. The email button uses the Clipboard API when available and falls back to the visitor's email app.

The TDS estimator includes selected resident payment types only. From 1 April 2026 it labels provisions using Section 393 of the Income-tax Act, 2025. It is an illustrative estimator, not a compliance determination. Current rules and rates can change; check the linked Income Tax Department sources and the transaction facts before relying on a result.

## Publish with GitHub Pages

1. Put the contents of this folder at the root of the `chetan-portfolio` repository.
2. Commit and push the files to the repository's publishing branch.
3. In GitHub, open **Settings → Pages**. Select **Deploy from a branch**, choose the intended branch and `/ (root)`, then save.
4. Wait for the Pages deployment to finish. The intended URL is `https://chetanbhatiya.github.io/chetan-portfolio/`.
5. Open the deployed site and verify navigation, theme persistence, project links, and mobile layout.

The canonical and social metadata use the portfolio URL supplied in the brief. Update those URLs if the site is published elsewhere.

## SEO checklist

- [x] Unique page title and meta description
- [x] Canonical URL
- [x] Open Graph and X/Twitter summary metadata
- [x] Semantic sections, accessible navigation, and one primary heading
- [x] Person JSON-LD with supplied public profile links
- [ ] Add a social sharing image (1200 × 630) and set `og:image` / `twitter:image`
- [ ] Add a `robots.txt` and sitemap if the site grows beyond this single page
- [ ] Connect Google Search Console or another search console after publishing
- [ ] Confirm the canonical URL matches the final deployed address

## Launch review checklist

- [ ] Open `index.html` directly and at the GitHub Pages URL
- [ ] Check the page at narrow mobile, tablet, laptop, and wide desktop widths
- [ ] Use keyboard-only navigation and confirm focus remains visible
- [ ] Confirm reduced-motion settings suppress decorative movement and reveal transitions
- [ ] Switch themes, reload, and confirm the chosen theme persists
- [ ] Try project filters, copy-email, mobile navigation, and back-to-top
- [ ] Confirm external profile, repository, and live-site links point to the intended accounts
- [ ] Check the browser console and network panel for missing files or errors
- [ ] Verify that the expense tracker remains marked in progress until it is actually complete
- [ ] Check GST calculations for both tax-exclusive and tax-inclusive amounts
- [ ] Check TDS estimates against the relevant Income Tax Department table for the actual payer/payee facts
- [ ] Generate a sample chart and open the downloaded SVG

No deployment or cross-browser checks have been run from this deliverable folder.
