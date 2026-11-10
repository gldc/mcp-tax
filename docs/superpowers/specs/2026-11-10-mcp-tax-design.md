# MCP Tax design

Approved design: static GitHub Pages site for mcp-tax.com, public source at gldc/mcp-tax.

## Purpose

Show what vendors require to access their official MCP servers. Celebrate vendors that explicitly include access, and document plan gates, separate fees, metering, and limited free access. This is an MCP directory, not an SSO directory or an AI-client subscription comparison.

## Experience

Use MCP Explained's visual vocabulary: warm charcoal #191615 and cream #F5F3EF, thin rules, restrained green/amber/red, compact panels, clean sans-serif headings and monospace metadata. Original composition and copy; no Runlayer logo or implied sponsorship.

A small header contains the project name, methodology and GitHub links, and light/dark controls. A concise introduction explains the project's position. Summary counts and status filters lead to a searchable, sortable vendor table. Vendor selection opens an evidence inspector on desktop and expands inline on mobile. Each record has a stable URL fragment. A prominent no-tax honor roll gives included-access vendors equal visibility. Methodology and contribution instructions are accessible from the page.

## Evidence and classification

Store records as structured JSON. Each record includes id, name, category, status, access description, cost description, concise summary, conditions, official evidence links with claim paraphrases, and last-checked date. No unsupported numeric price or percentage. Absence of a published fee is not evidence of free access.

Statuses:
- included: explicit all-plan/included or no-extra-charge evidence; ordinary product costs disclosed.
- limited: a free MCP-specific quota with paid expansion or partial tools behind a paid tier.
- gated: a paid-plan or seat prerequisite for the reviewed server.
- metered: an MCP-specific fee, per-call credit consumption, or MCP activity causing a billable seat; distinguish underlying product usage.
- unclear: current official information does not establish pricing or availability.

Mixed vendors retain caveats in the summary and inspector. Self-hosted and vendor-hosted implementations are distinguished. Product-feature entitlements and normal API limits alone do not imply a protocol surcharge. Future announced charges stay future-dated. Preview access is visibly marked. The site calls a classification an editorial assessment grounded in linked terms.

## Architecture

Dependency-free HTML, CSS and browser JavaScript; a Node build produces dist from the JSON and static templates. Generate readable vendor content at build time so the directory works without JavaScript and is indexable. Client JavaScript progressively enhances filtering, sorting, details, share links, and theme. No backend, keys, analytics, forms that silently send data, or external runtime CDN dependency.

GitHub Actions validates data and builds before deployment. A pull request carries source changes; default branch is never directly pushed. Configure GitHub Pages and mcp-tax.com through available authenticated capabilities. DNS and HTTPS are verified separately; a configured domain is not a live-site claim.

## Validation

Node checks reject duplicate IDs, missing evidence, invalid status/date/URLs, and incomplete pricing claims. Real browser checks cover search, combined filters, zero results, vendor evidence, URL fragments, keyboard access, light/dark mode, and narrow-screen overflow. Capture desktop/mobile evidence and console status. Record taste receipts on the exact clean commit. Probe published HTML and DNS/TLS before reporting live.

## Alternatives considered

1. Dependency-free static generation (selected): smallest deployment surface, readable source, suitable for GitHub Pages.
2. Astro: convenient content components, but unnecessary dependency/build surface for one directory.
3. A backend/CMS: easier non-Git editing, but introduces hosting and authentication beyond the initial need.
