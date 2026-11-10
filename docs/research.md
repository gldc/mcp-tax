# Research notes

Initial coverage: 37 official vendor MCP offerings, checked November 10, 2026. The canonical source URLs, claim paraphrases, checked dates, deployment scope and caveats are in `data/vendors.json`. This is an editorial comparison of access terms, not a complete directory or a billing audit.

Researchers reviewed official documentation, pricing pages, vendor repositories, release notes and seller-identified marketplace listings. Specific current server and pricing guidance takes precedence over older announcements or broad feature labels when the record explains the conflict. Search snippets alone do not establish a current price. Dollar amounts are retained only where the research established currency, unit and billing cadence; no percentage uplift is inferred.

Status describes the reviewed offering: `included` needs explicit included/all-plan or no-extra-charge evidence; `limited` covers MCP quotas or partial paid-tool access; `gated` covers a paid prerequisite; `metered` covers MCP-related credits, tasks or billable seats; `unclear` preserves gaps in published terms. Ordinary API limits, resource usage, AI processing and client subscriptions are described separately. Honor-roll eligibility additionally requires explicit included-access evidence. It does not promise every tool is free, unlimited or available to every user.

Important conflicts and transitions:

- GitLab's specific server guide and 19.2 release announcement establish Free access, despite the umbrella MCP page retaining a paid-tier label.
- Figma's current live rate-limits page gives a 20-call monthly allowance for affected seats. Older official indexed material gave six; do not mix the versions. Its announced future usage pricing concerns canvas writing during beta, not all MCP calls.
- Box's current pricing guide says all plans; its older GA announcement says Business and above. Free API calls additionally require a published integration and personal OAuth; other workflows incur API charges.
- ClickUp is migrating plans. New Max and legacy Everything AI have different packaging; new and existing Enterprise quotas also differ. Indexed legacy prices are excluded.
- Coda became Superhuman Docs. The current Docs MCP permits Editor writes under a limited allowance; legacy Coda Editor restrictions and retained customer pricing are separate.
- monday.com's dedicated API documentation gives a Free daily limit of 200, conflicting with a general AI page's 1,000. The record retains that conflict.
- Asana's explicit free Marketplace offering and free-account integration availability support its scoped included classification. A universal direct V2 fee policy remains unverified. Netlify's explicit connection-cost evidence is similarly scoped to its documented coding-agent workflow.

Announced changes remain future-dated as of the checked date: Atlassian extra-usage billing on December 3, 2026; Zapier billing exceptions on December 1, 2026; and Salesforce HPI metering with a multiplier still TBA and a promised 30-day notice. Figma canvas-writing beta pricing has no asserted start date. Sentry's pricing evidence mentions a December 8 Seer credit change, distinct from MCP access. Stripe's November 30 API-key migration deadline concerns authentication, not a new MCP fee.

No customer accounts, paid subscriptions, invoices or live billing behavior were tested. Tool availability, negotiated pricing, regional pricing and admin controls can differ. `unclear` means the reviewed evidence does not settle the question; missing pricing is not proof of free access. The JSON validator checks metadata structure and consistency, not the truth, freshness or completeness of source claims. This assembly step did not independently reopen every source URL.

There is no automated ongoing source monitoring. Checked dates age, announced changes may take effect, and contributions need a fresh primary source plus the affected scope and checked date. Source excerpts are paraphrased evidence notes; the code license does not grant rights to third-party source material, names or marks.
