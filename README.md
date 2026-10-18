# IBMA Accounting

React + TypeScript + Vite source recovered from the repository's own historical source archive. The existing black/gold design and Arabic, English, and French content are retained.

## Local verification

Use Node 24.13.0 (or a supported Node version >=22.12).

```sh
npm ci
npm run build
npx playwright install chromium
npm test
```

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
