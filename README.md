# IBMA Accounting

React + TypeScript + Vite source recovered from the repository's own historical source archive. The existing black/gold design and Arabic, English, and French content are retained.

## Local verification

The committed lockfile uses public npm tarball URLs so Cloudflare can install
the same integrity-checked packages without access to a local/private registry.

Use Node 24.13.0 (or a supported Node version >=22.12).

```sh
npm ci
npm run build
npx playwright install chromium
npm test
npm run test:layout
```

The layout suite checks 320, 360, 390, 473, 768, and 1440px widths in Arabic,
English, and French: a single-line orbit instruction, compact section spacing,
the designer link, and a footer credit that stays visible above the fixed
contact bar without duplicate bottom padding.
It also checks three paired rows of footer links, separate call/WhatsApp targets,
external Google Maps directions, and address copying with permission-denied feedback.
Portrait checks cover a stationary circular photo, independently rotating gold
decoration, and reduced-motion support. Email checks cover separate mailto/copy
actions and clipboard success/failure feedback.

## Existing public address

- Primary shared address: https://ibma.almarashly84.workers.dev/
- Additional Pages address: https://ibma-accounting-review.pages.dev/
- Both use the same `Ibma` repository. Production follows `main`.
- Keep the existing `ibma` Worker name and shared address; a new repository or
  replacement public URL is not needed for website updates.

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
- Root directory: repository root
- No API keys, database, or runtime environment variables are required.
- The generated `dist/_headers` file configures security headers and long-lived caching for fingerprinted assets.
- Images are local WebP assets, not dependencies on the MeDo hosting CDN.

## Important behavior and publication checks

- The appointment form prepares a WhatsApp draft addressed to the phone already present in the original source. It does **not** send automatically, store contact details on a server, reserve availability, or confirm appointments.
- Office-hour validation uses `America/Toronto`; Sundays and Saturday evening slots are unavailable. Availability is not connected to the accountant's real calendar.
- Visitors must explicitly open WhatsApp and send the prepared message, then wait for office confirmation. The form warns against submitting tax identifiers, banking information, or sensitive tax information.
- Hard-coded testimonials, stock portraits, a fixed 5.0 score, and unverifiable “Google verified” badges were replaced with the original direct Google business-page link. No claim is made that its reviews have been independently verified.
- Generic social-network homepage links were removed; the original business-specific Facebook link remains.
- Contact information, business credentials/experience, professional qualifications, the Google business-page link, and existing commercial copy must be confirmed by the business owner before publication.
- A custom domain has not been selected or verified. Canonical URLs and social-image absolute URLs should be configured only after that decision. Do not change unrelated Cloudflare zones.
- No real booking message is sent during the automated tests.
