# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for Salmon HVAC, an HVAC contractor serving Northern Utah (Davis, Weber, Salt Lake, and Morgan counties). The site is SEO-optimized with location-specific landing pages, service pages, and a blog.

**Business:** Salmon HVAC LLC, Centerville UT, since 1979
**Phone:** (801) 397-0030
**Live URL:** https://salmonhvac.com

## CRITICAL: Deployment Configuration

**This project MUST ONLY deploy to:**

| Property | Value |
|----------|-------|
| Site Name | `salmon-hvac` |
| Site ID | `a9896567-7739-4354-be13-b04aad4e384f` |
| URL | https://salmon-hvac.netlify.app |
| GitHub | `jaymdenn/salmon-website` |

### Safe Deployment

```bash
# RECOMMENDED: Use the safe deploy script
./scripts/deploy.sh

# OR: Use explicit site ID
netlify deploy --prod --site a9896567-7739-4354-be13-b04aad4e384f
```

**NEVER** run `netlify deploy --prod` without the site ID - it may deploy to the wrong site.

## Development Commands

```bash
# Generate sitemap (runs automatically on Netlify build)
node scripts/generate-sitemap.js

# Build partials into HTML files (if using partial placeholders)
node scripts/build.js

# Local development - just open files in browser or use a local server
npx serve .
```

## Architecture

### Directory Structure

```
/                       # Root index.html (homepage)
/areas/                 # 23 city/location landing pages (e.g., centerville-ut/)
/services/              # 11 service pages (e.g., ac-repair/)
/blog/                  # Blog articles
/our-team/              # Team page (formerly /about/, redirected in netlify.toml)
/contact/               # Contact form page
/get-quote/             # Quote request form
/thank-you/             # Form submission confirmation
/assets/
  /css/style.css        # All site styles (single file)
  /js/main.js           # All site JavaScript (single file)
  /js/site-config.js    # Business constants (name, phone, services, cities)
  /images/              # All images (optimized WebP + fallback JPG)
  /partials/            # Reusable HTML fragments (nav.html, footer.html, cta.html)
/scripts/
  /deploy.sh            # Safe deployment with verification
  /generate-sitemap.js  # Auto-generates sitemap.xml from index.html files
  /build.js             # Inlines partials into HTML (replaces <!-- PARTIAL:name -->)
```

### Key Configuration Files

- **`assets/js/site-config.js`** - Single source of truth for business data (name, address, phone, services list, cities list with tiers and counties). Referenced by build scripts.
- **`netlify.toml`** - Build command, redirects (/about/ → /our-team/), security headers, cache headers.
- **`.netlify-site`** - Contains site ID for deployment verification.
- **`sitemap.xml`** - Auto-generated during Netlify build.

### Partials System

HTML partials in `/assets/partials/` can be inlined using `<!-- PARTIAL:name -->` placeholders:
- `nav.html` - Header and navigation
- `footer.html` - Footer with links and contact info
- `cta.html` - Call-to-action section

Run `node scripts/build.js` to replace placeholders with actual content.

### Page Template Pattern

All pages follow this structure:
1. GTM scripts in `<head>` and `<body>`
2. Schema.org JSON-LD markup (HVACBusiness, LocalBusiness, Service, etc.)
3. Header with navigation (dropdown menus for Services and Areas)
4. Page content
5. CTA section
6. Footer
7. `<script src="/assets/js/main.js" defer>`

### JavaScript Features (main.js)

- Header scroll effect (adds `.scrolled` class)
- Mobile menu toggle with hamburger animation
- Mobile dropdown toggles for nav menus
- Form field error styling
- Scroll-triggered animations (`.animate-on-scroll`)
- Smooth scroll for anchor links
- Active nav link highlighting

### CSS Organization (style.css)

Single CSS file with sections for:
- CSS variables (colors, typography, spacing)
- Base/reset styles
- Header and navigation (including mobile menu)
- Hero sections
- Service cards and grids
- Area/location pages
- Testimonials
- Forms
- Footer
- Responsive breakpoints

### SEO Features

- Schema.org structured data on every page (HVACBusiness, LocalBusiness, Service, FAQPage)
- Open Graph and Twitter Card meta tags
- Canonical URLs
- Auto-generated sitemap with priorities:
  - Homepage: 1.0
  - Services: 0.9
  - Areas: 0.8
  - Blog: 0.7
  - Other: 0.6

## Content Guidelines

### Service Areas

Cities are tiered by priority in `site-config.js`:
- **Tier 1** (primary): Centerville, Bountiful, Layton, Kaysville, Farmington, Ogden, Morgan, Salt Lake City
- **Tier 2** (secondary): Clearfield, Roy, South Jordan, Sandy, West Jordan, Draper, North Salt Lake, Woods Cross, West Bountiful, Clinton, Fruit Heights, Syracuse, West Haven, North Ogden, Ogden Valley

### Services

11 core services: AC Repair, AC Installation, AC Maintenance, Furnace Repair, Furnace Installation, Heat Pump Services, Ductless Mini-Split, VRF Systems, Commercial HVAC, Indoor Air Quality, Emergency HVAC

### Forms

Contact and quote forms use Netlify Forms (native integration, no backend needed). Forms redirect to `/thank-you/` on submission.
