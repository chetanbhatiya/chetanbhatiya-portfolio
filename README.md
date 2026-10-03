# Chetan Bhatiya Portfolio

Colorful, responsive personal portfolio made with vanilla HTML, CSS, and JavaScript. There is no build step or backend.

## Files

```text
outputs/
├── index.html      Portfolio, SEO metadata, calculators, learning log
├── style.css       Color system, themes, layout, responsive styles
├── script.js       Theme, navigation, calculators, chart export, saved progress
├── favicon.svg     Custom gradient favicon
├── 404.html        GitHub Pages not-found page
└── README.md       Setup and publishing guide
```

## Open locally

Open `index.html` in a modern browser. Google Fonts need an internet connection; system sans-serif fonts are used as a fallback. The GST calculator, selected-case TDS estimator, SVG chart maker, and learning log are client-side features.

The learning log stores completion in that browser's local storage. Use **Download backup** to keep a JSON copy and **Restore backup** to import it into another browser. This is local progress; the website does not send or publish it to recruiters.

## Publish to GitHub Pages

1. Keep all six files together in the root of the `chetan-portfolio` repository.
2. On GitHub, open the repository and choose **Add file → Upload files**.
3. Upload the files from this folder. For the three changed files (`index.html`, `style.css`, `script.js`), replace the old versions in your local project first, then upload/commit the updated copies.
4. Commit the changes to the branch used for Pages.
5. In **Settings → Pages**, use **Deploy from a branch**, select `main` and `/(root)`, and save.
6. Open `https://chetanbhatiya.github.io/chetan-portfolio/` after deployment.

## SEO and publish review

- [x] Title, description, canonical URL, Open Graph metadata, and Person structured data
- [ ] Add a 1200 × 630 sharing image and `og:image` after creating one
- [ ] Check the canonical URL matches the deployed site
- [ ] Review site at phone, tablet, laptop, and desktop widths
- [ ] Try keyboard navigation and reduced-motion preferences
- [ ] Confirm light/dark mode, local progress, backup restore, calculators, and chart export
- [ ] Check GitHub, LinkedIn, email, WhatsApp, and live project links

The TDS tool covers selected resident-payment examples and is an estimate only. New references use Section 393 of the Income-tax Act, 2025 for applicable transactions on or after 1 April 2026. Confirm the transaction, payer/payee status, and current official rules before using the result for compliance.
