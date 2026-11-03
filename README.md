# Celadon Eave: Landing Page

Static site (HTML/CSS/JS), no build step.

## Structure
- `index.html`: page
- `assets/`: styles, scripts, images
- `.github/workflows/pages.yml`: auto-deploys to GitHub Pages on push to `main`

## Connect GitHub
1. Create an empty repo on GitHub (no README).
2. `git remote add origin git@github.com:<you>/<repo>.git`
3. `git push -u origin main`
4. Repo Settings > Pages > Source: GitHub Actions.

## Connect a domain (after purchase)
1. Create a file named `CNAME` in the root containing just the domain, e.g. `example.com`.
2. At the registrar's DNS: four A records for `@` pointing to GitHub Pages IPs (see GitHub docs), and a CNAME for `www` pointing to `<you>.github.io`.
3. Repo Settings > Pages > Custom domain, then enable Enforce HTTPS.
