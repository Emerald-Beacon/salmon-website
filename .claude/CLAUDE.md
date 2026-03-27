# Salmon HVAC Website - Claude Code Instructions

## Project Overview
This is the Salmon HVAC website - a static HTML/CSS/JS site for an HVAC contractor in Northern Utah.

## CRITICAL: Deployment Configuration

**This project MUST ONLY be deployed to the following Netlify site:**

| Property | Value |
|----------|-------|
| **Site Name** | `salmon-hvac` |
| **Site ID** | `a9896567-7739-4354-be13-b04aad4e384f` |
| **URL** | https://salmon-hvac.netlify.app |
| **GitHub Repo** | `jaymdenn/salmon-website` |

### Safe Deployment Commands

**ALWAYS use one of these commands to deploy:**

```bash
# Option 1: Use the safe deploy script (RECOMMENDED)
./scripts/deploy.sh

# Option 2: Use explicit site ID
netlify deploy --prod --site a9896567-7739-4354-be13-b04aad4e384f
```

### NEVER Do This

```bash
# DANGEROUS - may deploy to wrong site if linked incorrectly
netlify deploy --prod

# DANGEROUS - site name lookup can fail
netlify deploy --prod --site salmon-hvac
```

### Before Any Deployment

1. Verify you are in the correct directory: `/Users/joshdennis/Documents/App Projects/Salmon Website`
2. Verify the git remote: `git remote -v` should show `jaymdenn/salmon-website`
3. Use the site ID explicitly: `a9896567-7739-4354-be13-b04aad4e384f`

## Project Structure

- `/areas/` - 17 city/location landing pages
- `/services/` - 11 service pages
- `/blog/` - Blog articles
- `/assets/` - CSS, JS, images
- `/scripts/` - Build and deployment scripts

## Key Files

- `.netlify-site` - Contains site ID for deployment verification
- `scripts/deploy.sh` - Safe deployment script with verification
- `netlify.toml` - Netlify configuration
- `sitemap.xml` - Auto-generated sitemap
