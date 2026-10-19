# IBMA Accounting — website + dashboard

Website for IBMA Accounting Ltd (Ottawa) in Arabic, English and French, with a dashboard at `/admin`.
Runs on **Cloudflare Workers** (Worker `ibma`) with a **D1** database (`ibma-db`) and **R2** storage (`ibma-media`).

- Public address: https://ibma.almarashly84.workers.dev/ (Production follows `main`)
- Languages have their own addresses: `/` (العربية), `/en/`, `/fr/` and privacy pages `/privacy`, `/en/privacy`, `/fr/privacy`.

## What the website does

| Part | Behaviour |
|---|---|
| Appointment form | Saves the request for the office (dashboard → طلبات المواعيد) and offers to send it by WhatsApp too. Validates office hours in Ottawa time. Optional, unticked box to subscribe to offers. |
| Subscribe section | «اشترك لتصلك عروضنا»: name + email + required consent box (CASL). The exact consent wording and date are stored. |
| Unsubscribe | Each subscriber has a private link `/unsubscribe?t=…` (in the CSV export). Opening it shows a confirmation; mail apps can also unsubscribe in one click (POST). |
| Privacy policy | Canadian policy (PIPEDA/CASL) in 3 languages, editable from the dashboard. |
| Statistics | Daily anonymous totals only (visits, clicks). No cookies, no names, bots not counted. |
| Services | One section «خدمات IBMA والحلول المتكاملة»: automatic poster slider (images managed in dashboard → صور السلايدر) + compact service icons. |
| Map | Google map loads only after the visitor presses «عرض الخريطة». The address card says «يوجد موقف سيارات مجاني». |
| Fonts | Served from the site itself (no Google Fonts request). |
| SEO | Per-language title/description, canonical + hreflang, `sitemap.xml`, `robots.txt`, share image `og-image.png`, structured data with opening hours. |
| Footer | English credit `by Alaa Eddin Digital Media` → https://www.alaadigital.at |

## Dashboard `/admin`

Tabs: الإحصائيات · طلبات المواعيد · المشتركون · الخدمات · صور السلايدر · الحملة الضريبية · التواصل وساعات العمل · عن المحاسب · النصوص وSEO · سياسة الخصوصية · الأمان.

There is no link to it on the website; open `/admin` after the site address.

**Security:** PBKDF2 password hash · forced change of the temporary password · HttpOnly/Secure/SameSite=Strict cookie, 7 days · lock 15 min after 5 wrong passwords · cross-site request blocking · server-side validation of every field · uploaded images checked by content · CSV formula neutralising · text only (no HTML) · strict CSP · IP addresses only as salted hashes, deleted within 48 h · requests older than 24 months deleted daily (cron).

## First-time setup (once)

1. Cloudflare → Workers & Pages → `ibma` → Settings → Variables and Secrets → **Add** → type **Secret**:
   `ADMIN_INITIAL_PASSWORD` = a temporary password (not used anywhere else).
2. Open `https://ibma.almarashly84.workers.dev/admin`, log in with it, then choose a personal password (required).
3. The temporary secret can then be deleted from Cloudflare.

## Before handing over to the client (to confirm with IBMA)

- [ ] «Authorized CRA Representative & E-Filer» badges (dashboard → النصوص وSEO / عن المحاسب): keep only if true.
- [ ] Numbers in «عن المحاسب» (15+ years, 2,500+, 850+, 99.4%) must be real.
- [ ] «يوجد موقف سيارات مجاني» in the contact section.
- [ ] Privacy policy reviewed by IBMA (privacy contact person, wording).
- [ ] Logo: the tagline under the logo was redrawn as «Accounting and Tax Services» (the old image showed «Serv.cc»). The designed posters still contain the old logo; ask for originals if available.
- [ ] Custom domain: when chosen, add it in Cloudflare (Settings → Domains & Routes); SEO tags follow the address automatically.
- [ ] The old Pages copy `ibma-accounting-review.pages.dev` has no server/database; delete it to avoid duplicate content in Google.
- [ ] Register the site in Google Search Console and submit `/sitemap.xml`.

## Development

```sh
npm ci
npm run build                      # type checks (site + server) and builds ./dist
printf 'ADMIN_INITIAL_PASSWORD=Local-Test-Only-2026\n' > .dev.vars
npx wrangler dev --local           # http://127.0.0.1:8787 with a local database
npx playwright install chromium
node --experimental-strip-types tests/api.mjs     # server + dashboard (fresh local database)
node --experimental-strip-types tests/smoke.mjs   # browser: pages, languages, booking
node tests/layout.mjs                             # 6 screen widths × 3 languages
```

Structure: `src/` React site · `src/content/` shared content model, defaults and validation (used by site and server) · `worker/` Cloudflare Worker · `public/admin/` dashboard · `tests/`.
