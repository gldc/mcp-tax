# MCP Tax

An independent, evidence-backed index of access to official Model Context Protocol servers. Public site: [mcp-tax.com](https://mcp-tax.com). No backend, dependencies, analytics or runtime CDN.

Built and maintained by [Runlayer](https://runlayer.com/?utm_source=github&utm_medium=referral&utm_campaign=mcp-tax), the AI control plane for MCP.

## Local development

Node.js 24 or newer:

```sh
npm test
npm run validate
npm run build
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. Stop the server with Ctrl-C. Source HTML, styles and progressive browser JavaScript live in `index.html` and `assets/`. `scripts/build.mjs` renders all vendor names and evidence from `data/vendors.json` into `dist/`, including readable content without JavaScript. Nothing in `dist/` is committed.

## Deployment

GitHub Actions validates, tests and builds before GitHub Pages deployment. Configure Pages to use GitHub Actions. The generated `CNAME` declares `mcp-tax.com`; the repository Pages settings, DNS and HTTPS must also be configured separately. Relative asset URLs support a project-path fallback.

## Corrections

See [CONTRIBUTING.md](CONTRIBUTING.md). Classifications are editorial assessments of official documentation, not account-level testing. Follow each record’s sources and checked date. Original code is MIT licensed; dataset licensing is documented separately.
