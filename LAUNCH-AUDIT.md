# Yeti Insurance website: v1 launch audit

**Status: technically ready.** The site passes every automated check. Before going live, you need to supply a few real details and get legal sign-off (see Blockers below).

## What was tested

| Area | Result |
|---|---|
| Build | 34 pages, 0 broken internal links |
| Browser QA (`qa-run.html`): every page at 6 screen widths (1440, 1280, 1100, 1024, 768, 390) | 0 failures, 39 checks passed |
| Sideways scrolling or header overflow on any page or width | None |
| JavaScript errors | None |
| Menus (hover, click, mobile tap, keyboard) | Pass |
| Quote, claim, contact and service forms (validation, steps, submission, reset) | Pass |
| Coverage finder, industry tabs, scroll fade-in | Pass |
| SEO: unique titles and meta descriptions, one H1 per page, canonical URLs, sitemap (32 URLs), robots.txt | Pass |
| Structured data (JSON-LD): agency, breadcrumbs, services, FAQs, articles | Valid on every page |
| Accessibility: every field has a label, buttons have readable names, alt text on images, headings in order, color contrast meets WCAG AA | Pass |
| Links: external links open safely in a new tab (`noopener`), no insecure `http://` links, no empty links | Pass |
| Page weight: homepage HTML 46 KB, CSS 34 KB, JS 14 KB, no web fonts to download | Very fast |
| Security headers (`netlify.toml`) | Configured |
| Redirects from old Wix URLs (`/team`, `/claim`, `/home`) | Configured |

## Placeholder safety

Any setting still wrapped in `[brackets]` is **hidden automatically** on the live site. Visitors never see placeholder text.

- **Reviews:** the slider is replaced with a "Read our reviews on Google" card until you add real reviews.
- **Carrier logo strip:** hidden until at least 3 carriers are listed.
- **License numbers, the review count line, and founder story and milestones:** hidden until filled in.
- **Missing photos:** the branded placeholder blocks show instead.

When you run `npm run build`, it prints a **Launch checklist** of everything still left to fill in.

## Blockers (do these before launch)

1. **Texas agency license number** in `src/site.js` → `license`.
2. **Legal review** of `/privacy/`, `/terms/` and `/producer-compensation-disclosure/`. These are good drafts, but they need sign-off from counsel or a compliance advisor.
3. **Form notifications:** after deploying to Netlify, turn on email alerts for the `quote`, `claim-notice`, `contact` and `service-request` forms. Then submit one test of each form on the live site.
4. **Confirm the service promises in the copy are true for your team:**
   - "follow up within one business day"
   - certificates "usually the same business day"
   - "Many policies can start the same day"
5. **Domain:** make `www.yetiinsu.com` the primary domain in Netlify, with HTTPS on, and redirect `yetiinsu.com` to it. The site's canonical URLs and sitemap use `www`.

## Strongly recommended before launch

- Logo files (`logo-navy.png`, `logo-white.png`) and `og-image.jpg`, the image shown when the site is shared on social media.
- Team photos, and an office photo for the homepage "Why Yeti" section.
- 3–5 real Google reviews (first name and city). Add them in `src/components.js` → `REVIEWS`.
- Your direct Google review link, review count and date (`src/site.js`).
- At least 3 carriers, with their claim phone numbers and payment links (`src/site.js` → `carriers`).
- Licensed agent review of the coverage and article copy.
- A Google Analytics 4 or Tag Manager snippet (the spot is marked in `src/layout.js`).

## Can wait until after launch (v1.1)

- Compressed hero video (`src/assets/media/hero.mp4`, under 3 MB).
- Agent license numbers on the team cards.
- Founder story and timeline milestones.
- Memberships and affiliations (BBB, IIAT, chamber of commerce). Add real ones only.
- More articles: 2 per month.
- City pages with unique local content.
- Optional: a Spanish-language version.
- Optional: a Content-Security-Policy header. The site currently uses small inline scripts, so the policy would need to allow them.

## Go-live steps

1. On your Mac, run `npm run build` (or double-click `start-mac.command`) and do a final click-through.
2. Upload the `dist` folder to Netlify, or connect it to a Git repository.
3. Point the domain and turn on HTTPS.
4. Set up form notifications and submit one test of each form.
5. Google Search Console: verify the site and submit `https://www.yetiinsu.com/sitemap.xml`.
6. Update the website link on your Google Business Profile, Facebook and Instagram.
7. After launch, check that the old Wix URLs redirect, and run PageSpeed Insights on the live site.
