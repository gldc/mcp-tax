# Compact Honor Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Celebrate included MCP access in a bounded logo gallery and provide one searchable full honor-roll directory view.

**Architecture:** Reuse the static Node builder and existing vanilla directory filters. Add one boolean filter option and one view state; bundle brand marks in a local SVG sprite.

**Tech Stack:** Node 24+, native ES modules, semantic HTML, CSS, GitHub Pages; no new runtime dependencies.

## Global Constraints

- Follow the approved design in `docs/superpowers/specs/2026-11-12-compact-honor-gallery-design.md`.
- Work only in `/Users/gldc/Developer/.worktrees/mcp-tax-launch`, feature branch `feat/compact-honor-gallery`, starting at `38323b2984678dda30e4959ca5dbb16d437af6dc`.
- Preserve all 199 data records, 125 honor-roll memberships, existing vendor permalinks and MCP favicon.
- No pushes or external writes by implementation/review workers; root handles publication.
- No new library dependency, remote runtime asset request, unsupported logo, pricing or rank claim.

### Task 1: Implement gallery and directory view

**Files:** `index.html`, `scripts/build.mjs`, `assets/style.css`, `assets/site.js`, `assets/directory.mjs`, new `assets/honor-logos.svg`, `tests/site.test.mjs`.

**Interfaces:** `filterVendors(vendors, {honorOnly = false, query, status, category, sort})` returns a fresh sorted array; honor membership requires `v.noTax === true`. The builder replaces `{{HONOR}}` with at most twelve eligible selected brand links using local SVG symbols. `{{HONOR_COUNT}}` remains derived from all eligible records.

- [ ] Write a failing filter test with included/noTax true, included/noTax false, and gated records; `honorOnly: true` must exclude the latter two while respecting search/category/sort. Removing the membership condition must fail it.
- [ ] Write a failing builder test with eligible GitHub, ineligible Cloudflare and extra non-featured honor-roll records. The bounded gallery must include GitHub, exclude Cloudflare, retain the full total, and link to evidence. The rest of the directory must remain present. Remove the old exact-copy assertion when replacing that copy.
- [ ] Run `PATH=/Users/gldc/.asdf/installs/nodejs/24.18.0/bin:$PATH npm test`; capture expected failures before implementation.
- [ ] Add the boolean filter predicate; render only current eligible selected brands. Create symbols from `.yes-chef/research/honor-icons/simple-icons-16.37.0.tgz`, retaining source URLs and CC0 provenance in the sprite comment. Use SVG marks plus readable text names.
- [ ] Replace the wall with the approved gallery and add All vendors/Honor roll buttons. Wire the shared view state, CTA focus/scroll behavior, compatible status changes and reset. Preserve evidence and permalink handling.
- [ ] Add restrained responsive styles with twelve visible logos at desktop width, six at mobile width, focus/hover accent, dark/light variables and no looping motion.
- [ ] Run tests, validate, build and diff check; confirm `data/vendors.json` unchanged. Commit the seven implementation paths as one cohesive feature and record results in the worker report.

### Task 2: Verify, review and publish

- [ ] Root runs the feature through the real browser per `.agents/skills/verify-mcp-tax/SKILL.md`: 1440px/390px, both themes, logo counts, CTA, combined filters, reset, permalinks and console. Capture screenshots to the task evidence directory. Any defect returns to the implementer with concrete reproduction steps.
- [ ] Independent read-only reviewer checks the whole branch against the approved design, behavior and source provenance; implementer fixes findings, reviewer checks the fix diff.
- [ ] Root runs fresh clean-HEAD taste receipts for tests, validation, build, diff, browser evidence and unchanged data. Push feature branch, open PR, wait with pass, merge only the exact reviewed head.
- [ ] Confirm merged tree equals reviewed source; rerun fresh receipts on merged HEAD. Verify Pages build/deploy, DNS/TLS and exact served artifacts including the new SVG sprite. Confirm live gallery interactions in the browser, stop the owned preview server, archive evidence and report the live URL.
