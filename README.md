# Eenovative Technologies — Website

V2 — production multi-page consultancy site (16 pages) for **Eenovative Technologies** ("Where Intelligence Meets Innovation").
Built for GitHub Pages hosting with a Three.js 3D hero, glassmorphic design system, and a Google Sheets-backed contact form via Apps Script.

## Structure

```
├── index.html                        Home — outcome-led positioning, 3D hero
├── who-we-help.html                  SMEs / Startups / Schools / Enterprise / Public sector
├── services.html                     Services hub
├── service-*.html                    5 deep service pages (AI, automation, software & data, cloud/security/CRM, education)
├── industries.html                   Industries hub (8 sectors)
├── case-studies.html                 4 structured case studies (anonymised pending client permission)
├── products.html                     Ready-to-adapt systems
├── insights.html + insight-*.html    Insights hub + 2 launch articles
├── about.html                        Story, principles, differentiation
├── contact.html                      Consultation form, FAQs
├── 404.html                          Custom not-found page
├── css/main.css          Design system (tokens, components, responsive)
├── js/three.min.js       Three.js r128 (vendored — no CDN dependency)
├── js/field.js           3D hero (particles, edges, pulses, icosahedron)
├── js/site.js            Nav, reveals, counters, ambient canvas, form handler
├── assets/favicon.svg
├── apps-script/Code.gs   Google Apps Script backend (lead capture API)
├── CNAME                 Custom domain for GitHub Pages
├── robots.txt / sitemap.xml / .nojekyll
```

## Launch checklist (today)

### 1 — Push to GitHub

```bash
cd eenovative
git init
git add .
git commit -m "Launch: Eenovative Technologies website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/eenovative-website.git
git push -u origin main
```

### 2 — Enable GitHub Pages

Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → **Save**.
The site goes live at `https://YOUR_USERNAME.github.io/eenovative-website/` within a minute or two.

### 3 — Connect your custom domain

The `CNAME` file currently contains `eenovative-technologies.ai` — **edit it if your domain differs**, then:

1. In repo **Settings → Pages → Custom domain**, enter the same domain and save.
2. At your domain registrar, add DNS records:

   **Apex domain** (e.g. `eenovative-technologies.ai`) — four A records:
   ```
   A  @  185.199.108.153
   A  @  185.199.109.153
   A  @  185.199.110.153
   A  @  185.199.111.153
   ```
   **www subdomain** — one CNAME record:
   ```
   CNAME  www  YOUR_USERNAME.github.io
   ```
3. Back in Settings → Pages, tick **Enforce HTTPS** once the certificate is issued (can take up to an hour after DNS propagates).

If you change the domain, also update it in: `CNAME`, `robots.txt`, `sitemap.xml`, and the `<link rel="canonical">` / OG tags in each HTML file (find-and-replace `eenovative-technologies.ai`).

### 4 — Wire the contact form (Google Sheets)

GitHub Pages is static, so `google.script.run` no longer applies. The form now POSTs JSON to an Apps Script Web App:

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace the code with `apps-script/Code.gs` from this repo.
3. Run `setupDatabase()` once and authorise.
4. (Optional) set `NOTIFY_EMAIL` at the top to get an email per lead.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web app URL (ends in `/exec`).
7. Paste it into `js/site.js` as the `SCRIPT_URL` constant, commit and push.
8. Test: submit the form and confirm the row appears in *Contact Leads*.

> The form sends `Content-Type: text/plain` with a JSON body — this deliberately avoids the CORS preflight that Apps Script can't answer. Don't change it to `application/json`.

### 5 — Post-launch (optional but recommended)

- Submit `sitemap.xml` to [Google Search Console](https://search.google.com/search-console).
- Add an OG share image (`assets/og.png`, 1200×630) and reference it via `<meta property="og:image">` on each page.
- Verify the stats on the homepage (48+ club sessions, 20+ workshops, 5 platforms) against your records before promoting the site.

## Design system

- **Palette:** deep-space ink `#04070f`, electric `#4d8dff`, ember `#ff8a3d`, mist `#a9bcda`
- **Type:** Sora (display) · Manrope (body) · JetBrains Mono (technical labels)
- **Signature:** Three.js "synapse field" — 640 drifting nodes, ~1,100 live connection lines, ember signal pulses, rotating wireframe icosahedron; mouse-parallax; static-frame fallback for `prefers-reduced-motion`; pauses when off-screen or tab hidden.
- **Quality floor:** responsive to 360px, visible keyboard focus, reduced-motion respected, semantic landmarks, `aria-live` form status.

## V2 content notes (important)

- **Case studies are anonymised** ("Independent school, South-East London"). When written permission is secured from the client, replace with the named version — the page structure already supports it.
- **Team language uses "we"** throughout without claiming a specific in-house team composition. Keep it that way unless the delivery model changes.
- **Verify before promoting:** the 48+ club sessions, 20+ workshops and five-platform figures must match your own attendance and project records.
- **Roadmap:** named case studies with screenshots → remaining service pages (Salesforce standalone, cybersecurity, data analytics) → industry pages graduating from the hub as sector case studies accumulate → monthly Insights articles → per-page OG images.
