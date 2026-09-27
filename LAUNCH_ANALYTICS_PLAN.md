# Launch & Analytics Plan — Vietnam, Curated

Goal: put the app on your GoDaddy domain and know, at any moment, who is visiting, where they came from, what they plan, where they drop off, and what earns money.

---

## 0. Where the app stands today

| Area | Current state | Launch impact |
|---|---|---|
| App type | Vite + React single-page app, builds to static files in `frontend/dist` | Can be hosted almost anywhere |
| Backend | None | Nothing server-side to log or protect keys |
| AI chat (`/api/ask-llm`) | Runs only inside the Vite **dev** server (`configureServer`) | **Breaks in production** — must move to a real server function |
| Opening hours (`/api/place-hours`) | Dev + `vite preview` only | Same — needs a server function or pre-baked data |
| User data | Trip lives in the browser (`tripStore`, localStorage) | No accounts, no cross-device identity |
| Analytics / errors | None installed | Flying blind |
| Outbound links | All external clicks already pass through `OutboundRedirectProvider` | One place to track every booking / partner click |

---

## 1. Hosting on GoDaddy — two options

### Option A (recommended): domain at GoDaddy, site on Vercel or Cloudflare Pages

Keep the domain registered at GoDaddy; only change its DNS records.

- Free hosting, global CDN, automatic HTTPS.
- Every `git push` deploys; preview links per branch.
- Serverless functions for the AI chat live next to the site (same domain, key stays secret).
- GoDaddy steps: *My Products → Domain → DNS* → add the A / CNAME records the host gives you (e.g. `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com` for Vercel).

### Option B: GoDaddy's own hosting (cPanel / Web Hosting plan)

Works for the static site, with limits.

1. Run `npm run build` in `frontend/`.
2. Upload the **contents** of `frontend/dist` into `public_html` (File Manager or FTP).
3. Add `public_html/.htaccess` so deep links like `/plan/builder/itinerary` don't 404 on refresh:

   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

4. Turn on SSL in cPanel (AutoSSL) and force HTTPS.
5. The AI chat still needs a server: use a Cloudflare Worker or Supabase Edge Function (both free) and point the app's `/api/ask-llm` calls at it. Only some GoDaddy plans can run Node.js.

Downsides: manual uploads every change, no preview deploys, slower CDN, no built-in functions.

### Also set up on the domain

- **Email** (`hello@yourdomain`) via Google Workspace or Zoho Mail, with SPF / DKIM / DMARC records in GoDaddy DNS — needed for contact forms, Search Console, and not landing in spam.
- **www → root redirect** (or the reverse), so analytics and SEO see one site.

---

## 2. The analytics stack

| Layer | Tool | Why | Cost at launch |
|---|---|---|---|
| Product analytics | **PostHog** | Events, funnels, retention, paths, session replay, heatmaps, surveys, feature flags — one tool | Free up to ~1M events + 5K replays / month |
| Search & SEO | **Google Search Console** + **Bing Webmaster** | Which Google searches find you, indexing errors, rankings | Free |
| Marketing / acquisition | **Google Analytics 4** | Campaign attribution, Google Ads later, familiar reports | Free |
| Errors & speed | **Sentry** | JS crashes with the steps that led to them; Core Web Vitals | Free tier (5K errors / month) |
| Uptime | **UptimeRobot** or Better Stack | Alert when the site or AI endpoint is down | Free |
| Server data (phase 3) | **Supabase** | Sign-in, saved trips, AI request logs, rate limiting | Free tier |
| Consent | Small custom banner (or Cookiebot) | Legal requirement; gates the tools above | Free |

Why PostHog over GA4 as the main tool: GA4 is good at "where did traffic come from" but weak at "what did people do inside a planner" (funnels by trip state, replays, per-sight behaviour). Use GA4 only for acquisition and ads.

---

## 3. What to track (event plan)

Naming rule: `object_action`, snake_case, past tense. Every event automatically carries the **global properties** below.

### Global properties (attached to every event)

- `page_path`, `page_group` (landing, builder, sight_detail, guide, transfers, …)
- `trip_city_count`, `trip_sight_count`, `trip_has_dates`, `trip_length_days`
- UTM parameters and referrer (captured on first visit)
- Device, country, language (automatic in PostHog)

### Page views

SPA route changes don't reload the page, so capture `$pageview` manually on every React Router location change.

### Planning funnel

| Event | Key properties | Answers |
|---|---|---|
| `landing_cta_clicked` | `cta` | Which hero buttons work |
| `builder_started` | `entry` (landing, template, nav) | How many start planning |
| `builder_step_viewed` | `step` (when-to-go, experiences, stay, transport, eat, airport, logistics, itinerary) | Where people drop off |
| `trip_dates_set` | `mode`, `month`, `length_days` | When people travel |
| `city_filter_changed` | `city`, `action` (on/off) | Which cities draw interest |
| `sight_card_opened` | `sight_id`, `city`, `city_rank`, `list` | What gets clicked |
| `sight_added` / `sight_removed` | `sight_id`, `city`, `city_rank`, `source` | What actually gets planned |
| `activity_added` / `activity_removed` | `activity_id`, `city` | Same for activities |
| `stay_area_viewed`, `stay_compared` | `city`, `area` | Stay decisions |
| `transport_mode_viewed` | `mode`, `route` | Transport interest |
| `itinerary_viewed` | `days`, `cities`, `sights` | Plan completion |
| `itinerary_edited` | `action` (move, remove, retime) | Engagement with the plan |
| `itinerary_pdf_exported` | `days`, `sights` | Strongest "I'm going" signal |
| `template_viewed` / `template_used` | `template_id` | Do templates convert |

### Content engagement

| Event | Key properties | Answers |
|---|---|---|
| `guide_read_depth` | `sight_id`, `percent` (25/50/75/100) | Are the visitor guides read |
| `guide_audio_played` | `sight_id` | Is the speech player used |
| `sight_video_selected` | `sight_id`, `video_index` | Do people switch videos |
| `sight_video_played` | `sight_id`, `youtube_id` | Needs the YouTube IFrame API (plain iframes can't report plays) |
| `recipe_viewed`, `restaurant_opened`, `event_guide_viewed`, `shopping_item_viewed` | item id | Which side sections matter |

### AI chat

| Event | Key properties | Answers |
|---|---|---|
| `ask_question_submitted` | `page_group`, `question_length`, `topic` (classified, not raw text) | What people need help with |
| `ask_answer_received` | `latency_ms`, `provider`, `ok` | Reliability / speed |
| `ask_answer_rated` | `helpful` (yes/no) | Answer quality |

Store the full question text **server-side** (Supabase) with a retention limit — not in client analytics.

### Money

Hook into `OutboundRedirectProvider` so every external link is covered once:

| Event | Key properties |
|---|---|
| `outbound_prompt_shown` | `domain`, `label`, `page_group`, `sight_id` if any |
| `outbound_confirmed` | same |
| `outbound_cancelled` | same |

Add affiliate IDs and `utm_source=vietnamcurated` to partner links so partner dashboards match your numbers.

### Problems

- `search_no_results` (`query`, `section`) — content gaps.
- JS errors → Sentry (not PostHog events).

---

## 4. Funnels & dashboards to build

### Funnels

1. **Core planning:** landing viewed → `builder_started` → first `sight_added` → `itinerary_viewed` → `itinerary_pdf_exported` or `outbound_confirmed`.
2. **Content → plan:** `sight_card_opened` → `guide_read_depth` 75% → `sight_added`.
3. **Booking:** `outbound_prompt_shown` → `outbound_confirmed`, split by partner and page.

### Dashboards

| Dashboard | Main charts |
|---|---|
| Acquisition | Visitors by source / country / device; Search Console queries |
| Activation | Core funnel; drop-off by builder step |
| Content | Sights ranked by views vs adds (checks the editorial ranking against behaviour); guide read depth; video use |
| Retention | % returning in 7 / 30 days; returning users' trip size |
| AI | Questions per day, top topics, failure rate, latency |
| Revenue | Outbound clicks by partner, page, sight |
| Health | Errors per release, Core Web Vitals, uptime |

### Headline KPIs

- **Activation rate:** % of visitors who add at least one sight.
- **Plan completion:** % of builders who reach the itinerary.
- **Export rate:** % of itineraries exported to PDF.
- **Outbound CTR:** confirmed partner clicks per session.
- **7-day return rate.**

---

## 5. Identity (knowing a user over time)

- **Phase 1 (launch):** PostHog assigns an anonymous ID per browser. Trip size, dates, and cities are set as person properties from `tripStore`, so each visitor has a profile even without sign-in.
- **Phase 3 (accounts):** optional sign-in with Supabase (Google / email link). On sign-in, call `posthog.identify(userId)` so all earlier anonymous activity merges into that person, and trips sync across devices.
- Useful person properties: `home_country`, `trip_start_month`, `trip_length_days`, `cities_selected`, `first_seen_source`, `has_exported`.

---

## 6. Privacy & legal (must-have before tracking)

- **Consent banner** before any non-essential tracking: EU / UK visitors (GDPR) and India (DPDP Act 2023). Until consent, run PostHog in cookieless memory mode (or not at all) and keep GA4 in Consent Mode "denied".
- **Session replay:** mask all text inputs; exclude any page that could show personal data.
- **Privacy policy page:** what's collected, tools used (PostHog, GA4, Sentry, YouTube embeds), retention, contact email, how to request deletion.
- **Terms / affiliate disclosure** on pages with partner links.
- **Data retention:** e.g. raw AI logs 90 days, analytics per tool defaults.
- `noindex` or remove test routes: `/sights-templates/*` and Coming Soon pages.

---

## 7. SEO foundations (analytics is useless without traffic)

- Verify the domain in Search Console via a GoDaddy DNS TXT record.
- Generate `sitemap.xml` from the catalogs (sights, city pages, guides, recipes, events) and a `robots.txt`.
- Unique `<title>`, meta description, canonical URL, and Open Graph image per route (sight pages especially).
- Pre-render key routes (landing, city pages, sight detail pages) at build time — a pure client-rendered SPA gets indexed slowly and poorly.
- Watch page weight: large data files ship in the JS bundle; Sentry / Lighthouse will show whether first load is slow on mobile.

---

## 8. Server pieces needed

| Piece | Where | Notes |
|---|---|---|
| AI chat proxy | Vercel Function / Cloudflare Worker / Supabase Edge Function | Holds `GEMINI_API_KEY`; add **rate limiting** per IP so the free quota isn't drained by bots; log provider, latency, errors |
| Opening hours | Same, or pre-bake into static JSON at build time | Pre-baking is simpler and faster |
| AI request log | Supabase table `ask_logs` | question, page, provider, latency, ok, created_at |
| Saved trips (phase 3) | Supabase table `trips` | Linked to the signed-in user |

Environment variables (server only, never `VITE_`-prefixed): `GEMINI_API_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_KEY`.
Client-side (safe to expose): `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_GA4_ID`, `VITE_SENTRY_DSN`.

---

## 9. Rollout phases

### Phase 1 — Launch-ready (≈ 2–3 days of work)

- [ ] Pick hosting (Option A recommended); connect GoDaddy DNS; HTTPS; www redirect
- [ ] Move AI chat to a server function with rate limiting; handle opening hours
- [ ] Consent banner + privacy policy page
- [ ] PostHog installed; manual `$pageview` on route change; global properties
- [ ] Outbound tracking in `OutboundRedirectProvider`
- [ ] Core funnel events: `builder_started`, `builder_step_viewed`, `sight_added`, `itinerary_viewed`, `itinerary_pdf_exported`
- [ ] Sentry + UptimeRobot
- [ ] Search Console verified; `robots.txt`; sitemap
- [ ] Hide test / Coming Soon routes

### Phase 2 — First month after launch

- [ ] Remaining events (content, AI, stay, transport, templates)
- [ ] Dashboards + weekly KPI review
- [ ] GA4 with Consent Mode, UTM discipline for any promotion
- [ ] Per-route meta tags + Open Graph images; pre-render key routes
- [ ] YouTube IFrame API for real video-play tracking
- [ ] In-app survey (PostHog): "What stopped you finishing your plan?"

### Phase 3 — Growth

- [ ] Supabase accounts + saved trips + `identify`
- [ ] AI logs table + topic reports
- [ ] Affiliate IDs on all partners; revenue reporting
- [ ] Feature-flag A/B tests (landing hero, ranking changes, CTA copy)

---

## 10. Monthly cost at launch

| Item | Cost |
|---|---|
| Domain (GoDaddy) | Already paid (~₹800–1,500 / year renewal) |
| Hosting (Vercel / Cloudflare free tier) | ₹0 |
| PostHog, GA4, Search Console, Sentry, UptimeRobot | ₹0 on free tiers |
| Supabase | ₹0 on free tier |
| Business email (Zoho free / Workspace) | ₹0 – ~₹150 / user |
| Gemini / Groq AI | ₹0 on free keys; watch quota once traffic grows |

Paid tiers only become relevant past roughly tens of thousands of monthly visitors.
