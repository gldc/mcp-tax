---
name: verify-mcp-tax
description: Build and browser-verify MCP Tax with evidence before completion claims.
---

# Verify MCP Tax

## Launch

From the isolated repository worktree, run `npm run build`, then `python3 -m http.server 4173 --directory dist`. Open `http://localhost:4173`. Coordinate port ownership before starting another server. No credentials are needed.

## Doctor

Confirm Node 24+, `npm test`, `npm run validate`, and `npm run build` exit 0. Confirm `dist/index.html`, `dist/vendors.json`, `dist/CNAME` and `dist/.nojekyll` exist. Treat DNS, TLS and deployment as separate checks from a local build.

## Drive

At desktop width, select vendor evidence, follow a vendor permalink, search, combine status and category filters, sort, produce and reset zero results. Check keyboard focus and native summary activation. Toggle both themes and reload. Repeat at 390px width; details must expand inline and the document must not overflow horizontally. Test without JavaScript for readable records and official evidence.

## Evidence

Capture desktop and mobile screenshots, console errors, browser assertions, exact commit SHA and command exit codes. Review official source links and date copy; never call untested account access verified. A receipt only covers the exact commit checked.

## Cleanup

Stop only the server you started. Keep screenshots and the verification receipt in the task evidence folder. Do not commit generated `dist/`.

## Feature map

- Build and HTML escaping: `scripts/build.mjs`, `tests/site.test.mjs`
- Search/status/category/sort: `assets/directory.mjs`, `assets/site.js`
- Evidence, stable fragments, mobile details and theme: `assets/site.js`
- Original layout, responsive styles and reduced motion: `index.html`, `assets/style.css`
- Dataset quality checks: `scripts/validate.mjs`, `tests/data.test.mjs`
