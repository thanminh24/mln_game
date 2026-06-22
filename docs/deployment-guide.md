# Deployment Guide

## Platform

The MLN landing page is hosted as a static site on GitHub Pages:

- Repository: `thanminh24/mln_game`
- Production URL: `https://thanminh24.github.io/mln_game/`
- Source: `MLN_landing_page/01-apple-fluid/`
- Workflow: `.github/workflows/deploy-pages.yml`

The archived game in `MLN_Game/` is not built, deployed, or hosted.

## Automatic deployment

A push to `main` deploys when the landing app, shared landing content, or Pages workflow changes. The workflow:

1. Installs the lockfile-pinned pnpm dependencies.
2. Builds the Vite app as static files.
3. Uploads only the generated landing-page artifact.
4. Deploys that artifact to the `github-pages` environment.

The Vite `base` is relative, so bundled images, scripts, and styles work below the `/mln_game/` repository path and remain portable to a custom domain.

## Manual deployment

In GitHub, open **Actions → Deploy MLN landing page → Run workflow**. From the CLI:

```bash
gh workflow run deploy-pages.yml --repo thanminh24/mln_game
gh run watch --repo thanminh24/mln_game
```

No environment variables or repository secrets are required.

## Local verification

```bash
cd MLN_landing_page/01-apple-fluid
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

## Rollback

Revert the landing-page change on `main` and push it. The workflow will publish the previous static build. A successful earlier workflow run can also be re-run from the Actions page.

## Custom domain

Configure a custom domain in **Repository settings → Pages** and add the DNS records GitHub provides. A custom domain is optional; HTTPS is supplied for the standard `github.io` address.
