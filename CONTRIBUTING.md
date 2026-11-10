# Contributing

[Suggest a vendor or correction](https://github.com/gldc/mcp-tax/issues/new?template=vendor.yml), or open a pull request with a small change to `data/vendors.json`. Use current official documentation and paraphrase the supported claim. Do not infer free access from a missing price.

The dataset is an array of records:

| Field | Meaning |
| --- | --- |
| `id` | Unique stable lowercase fragment identifier |
| `name`, `category` | Vendor display name and product category |
| `status` | `included`, `limited`, `gated`, `metered` or `unclear` |
| `access` | Plan, seat or other prerequisite |
| `cost` | MCP-specific charges and ordinary product costs, distinguished |
| `summary` | Concise editorial assessment, including mixed offerings |
| `conditions` | Array of caveats |
| `sources` | Array of `{title, url, evidence}` with official HTTPS URLs and claim paraphrases |
| `checked` | Date reviewed, `YYYY-MM-DD` |
| `delivery` | Vendor-hosted, self-hosted or mixed implementation |
| `preview` | Optional boolean for preview access |
| `notice` | Optional material caveat |
| `noTax` | Optional boolean; only explicit included-access evidence qualifies for the honor roll |

An ordinary API limit, product subscription, AI inference cost or feature entitlement alone does not establish an MCP surcharge. Keep future fees future-dated and preview availability visible. Include no unsupported prices, discounts or percentages.

Run `npm test`, `npm run validate`, and `npm run build` before submitting. Check narrow and wide layouts, keyboard controls, evidence links and the no-JavaScript page after UI changes. Preserve stable IDs when correcting records.
