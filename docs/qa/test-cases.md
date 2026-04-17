# Test Cases · Jakarta Smart Routing Dashboard

Priority legend: **P0** blocker · **P1** high · **P2** medium · **P3** low.
Type legend: **F** functional · **N** non-functional · **S** security · **A11Y** accessibility · **D** data correctness.

Each case states preconditions, steps, and expected result. Cases are numbered for traceability to bugs filed in the [execution report](./test-execution-report.md).

---

## Suite A — Mock data generator

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-D-001 | P0 | D | `getMockData()` returns exactly 600 transactions. |
| TC-D-002 | P0 | D | Every transaction has non-empty `id`, ISO `timestamp`, `amount ∈ [50_000, 5_000_000]`, `currency === "IDR"`, valid enum `paymentMethod`, `processor`, `status`. |
| TC-D-003 | P1 | D | `timestamp` values fall within `[now − 14d, now]`. |
| TC-D-004 | P1 | D | Overall status mix: Approved ≈ 82% ± 3pp, Declined ≈ 15% ± 3pp, Failed ≈ 3% ± 2pp over 600 rows. |
| TC-D-005 | P1 | D | Processor distribution: A 40% ± 5, B 25% ± 5, C 20% ± 5, D 10% ± 3, E 5% ± 3 across 600 rows (GoPay-pin biases B slightly higher — still within band). |
| TC-D-006 | P0 | D | For transactions with `timestamp within last 48h AND processor === "Processor B"`, approval rate ≤ 75% (spec target 65%). |
| TC-D-007 | P0 | D | For transactions with `timestamp older than 48h AND processor === "Processor B"`, approval rate ≥ 82% (baseline 88% minus statistical jitter). |
| TC-D-008 | P1 | D | ≥ 60% of `paymentMethod === "GoPay"` transactions route to Processor B (spec: 70% ± 5pp). |
| TC-D-009 | P1 | D | `PROCESSOR_METRICS` exports baselines A 0.90, B 0.88, C 0.85, D 0.80, E 0.75 (exact). |
| TC-D-010 | P2 | D | `id` values are unique across all 600 rows. |
| TC-D-011 | P2 | D | Returned array is sorted by timestamp descending. |
| TC-D-012 | P2 | D | Repeated calls to `getMockData()` within a single session produce identical data (determinism — needed so charts and table agree). |

## Suite B — Filter state & URL contract

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-F-001 | P1 | F | Fresh load with no query string defaults to `preset=14d`, `method=all`. |
| TC-F-002 | P1 | F | Clicking "Last 24 hours" preset sets `?range=24h` in URL, clears `from`/`to`. |
| TC-F-003 | P1 | F | Direct load of `/?range=7d` renders the 7-day window. |
| TC-F-004 | P1 | F | Direct load of `/?method=GoPay` selects GoPay in the filter. |
| TC-F-005 | P2 | F | Invalid `?range=foo` falls back to default `14d`. |
| TC-F-006 | P2 | F | Invalid `?method=bitcoin` falls back to default `all`. |
| TC-F-007 | P2 | F | `?range=14d&method=OVO` combined filter round-trips on back/forward navigation. |
| TC-F-008 | P1 | F | Changing method filter updates the URL without full page reload. |
| TC-F-009 | P1 | F | Clicking "All methods" resets `?method=` to default (query key removed or set to `all`). |
| TC-F-010 | P0 | F | Selecting a range in the calendar (custom from+to) writes `?range=custom&from=<iso>&to=<iso>` to the URL. |
| TC-F-011 | P0 | F | After selecting a custom range, reloading the page preserves the same custom window. |
| TC-F-012 | P1 | F | Switching from custom back to a preset clears `from` and `to` from URL. |
| TC-F-013 | P2 | F | Custom range where `from > to` is rejected (or silently swapped) — no negative-length windows. |
| TC-F-014 | P3 | F | Custom range in the future (`from > now`) is clamped to now or rejected. |
| TC-F-015 | P2 | F | Timezone displayed in the picker label matches the user's locale (no UTC off-by-one at midnight boundaries). |

## Suite C — Data correctness across components

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-D-020 | P0 | D | KPI "Total Volume" equals the sum of `amount` for the currently filtered transaction set. |
| TC-D-021 | P0 | D | KPI "Approval Rate" equals `approved / total` over the filtered set. |
| TC-D-022 | P0 | D | Donut slice % for each processor matches table's filtered count % for that processor (single source of truth). |
| TC-D-023 | P0 | D | Transaction table row count equals the number summarized in the "Showing X of Y" footer and matches the total implied by KPIs. |
| TC-D-024 | P1 | D | Approval Rate Over Time points never exceed 100% or go below 0%. |
| TC-D-025 | P1 | D | Buckets with zero transactions render as gaps, not as 0% (or explicitly as 0% — behavior documented and consistent). |
| TC-D-026 | P1 | D | Processor Approval bar "Current" for a processor equals `approved / count` for that processor in the filtered set. |
| TC-D-027 | P1 | D | Processor Mix donut slice count × 100 / total equals the `share` field from the hook. |

## Suite D — Smart Alerts / anomaly detection

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-A-001 | P0 | F | With the default 14-day window, at least one alert fires for Processor B (seeded anomaly). |
| TC-A-002 | P0 | F | With a 24-hour window, Processor B's alert is Critical (≥ 15 pp drop) and copy includes processor name, current %, baseline %, and drop delta. |
| TC-A-003 | P1 | F | When the filter is set to `method=Visa`, Processor B alert disappears (Visa doesn't route via the pin; anomaly is GoPay-heavy). |
| TC-A-004 | P1 | F | Processors not anomalous (A/C/D/E) do not generate alerts in any default window. |
| TC-A-005 | P1 | F | When filtered result has < 5 transactions for a processor, no alert fires (min-volume guard prevents noise). |
| TC-A-006 | P1 | F | Alert card uses `AlertTriangle` icon and red-tinted border as specified. |
| TC-A-007 | P2 | F | Empty alerts state shows a green "all clear" card — never renders an empty `<div>`. |
| TC-A-008 | P2 | F | Drop calculation is `baseline − current` (absolute pp), not `(baseline − current) / baseline` (relative). Documented in code and confirmed in UI copy. |

## Suite E — Transaction Explorer table

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-T-001 | P0 | F | Table reflects current global date + method filter on every filter change. |
| TC-T-002 | P0 | F | Sorting Time column toggles asc/desc and icon reflects state. |
| TC-T-003 | P0 | F | Sorting Amount column works numerically (not lexicographically). |
| TC-T-004 | P1 | F | Default sort is Time descending (newest first). |
| TC-T-005 | P1 | F | Pagination: 10 rows per page; Next advances; Previous retreats; buttons disable at bounds. |
| TC-T-006 | P1 | F | "Showing X–Y of Z" footer is accurate at first page, last page, and empty set. |
| TC-T-007 | P1 | F | Local search filters by substring of `id` (case-insensitive). |
| TC-T-008 | P1 | F | Local search filters by substring of `processor` name (case-insensitive). |
| TC-T-009 | P2 | F | Search resets pagination to page 1. |
| TC-T-010 | P2 | F | Clearing search restores the full filtered set. |
| TC-T-011 | P1 | F | Status cell renders green badge for Approved, red for Declined, gray for Failed. |
| TC-T-012 | P2 | F | Declined / Failed rows have a subtle background tint for at-a-glance scanning. |
| TC-T-013 | P1 | F | Empty set renders an empty-state message — not a collapsed row. |
| TC-T-014 | P2 | F | Search term longer than 256 chars does not crash the table. |
| TC-T-015 | P2 | S | Search term containing `<script>` does not execute as HTML. |

## Suite F — Transaction details sheet

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-S-001 | P0 | F | Clicking a row opens the sheet with that transaction's data (never a stale previous row). |
| TC-S-002 | P0 | F | Sheet shows: id, amount (IDR formatted), method, processor, timestamp, status badge. |
| TC-S-003 | P0 | F | Sheet shows Routing details: Rule triggered, Response time (ms), Attempts, Region, Risk tier + score, Acquirer. |
| TC-S-004 | P1 | F | Approved status shows Auth code section (green). Declined shows decline code + message (red). Failed shows failure code + message (gray). |
| TC-S-005 | P1 | F | GoPay + Processor B transaction ALWAYS shows `Method Pinning` as the rule triggered. |
| TC-S-006 | P1 | F | Routing path journey renders numbered steps, each with duration in ms. |
| TC-S-007 | P1 | F | Opening the same transaction twice yields identical routing details (deterministic — hash-based). |
| TC-S-008 | P2 | F | Sheet closes via X button, ESC key, and clicking overlay. |
| TC-S-009 | P1 | A11Y | Sheet has accessible title + description; focus moves inside on open and returns to trigger on close. |

## Suite G — Layout, responsiveness, performance

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-N-001 | P2 | N | At 1440px viewport, grid is 4 columns; KPIs span 1 each; trend chart spans full width. |
| TC-N-002 | P2 | N | At 768px viewport, grid collapses to 2 columns. |
| TC-N-003 | P2 | N | At 375px viewport, grid collapses to 1 column; all widgets remain visible and scrollable. |
| TC-N-004 | P1 | N | Sidebar is reachable on mobile viewports (hamburger / drawer) — or explicitly documented as desktop-only. |
| TC-N-005 | P2 | N | First contentful paint < 2.0s on a cold local dev server (informational baseline). |
| TC-N-006 | P2 | N | Changing filter settles within 150ms at 600 rows (memoization budget). |
| TC-N-007 | P3 | N | Zoom to 200% (browser zoom) — no overlapping text, no horizontal scroll traps. |
| TC-N-008 | P2 | N | Recharts SVG labels remain legible at 375px (font-size ≥ 10px after scaling). |

## Suite H — Accessibility

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-A11Y-001 | P1 | A11Y | Keyboard tab order flows: header filters → main content → table → pagination. No keyboard traps. |
| TC-A11Y-002 | P1 | A11Y | Table rows are focusable and activatable via Enter/Space (not mouse-only). |
| TC-A11Y-003 | P1 | A11Y | Status badge color is accompanied by text — no color-only information conveyance. |
| TC-A11Y-004 | P1 | A11Y | Alert card severity is conveyed by both icon+color AND text ("Critical"/"Warning"). |
| TC-A11Y-005 | P1 | A11Y | All form controls have visible labels or `aria-label` (search input, selects). |
| TC-A11Y-006 | P1 | A11Y | Contrast ratios: body text ≥ 4.5:1, large text ≥ 3:1, destructive/warning badges meet 3:1. |
| TC-A11Y-007 | P2 | A11Y | `html[lang="en"]` is set. (Consider `id-ID` when the product ships to Indonesia.) |
| TC-A11Y-008 | P2 | A11Y | Dialog focus trap: once the sheet opens, Tab cycles inside it. |

## Suite I — Security & data handling

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-SEC-001 | P1 | S | No secrets, API keys, or PII are present in repo / generated bundle (`grep` for typical patterns). |
| TC-SEC-002 | P1 | S | URL query values are sanitized: malformed `?range=<script>` does not execute. |
| TC-SEC-003 | P2 | S | Transaction `id` and `amount` are not logged to `console.*` in production. |
| TC-SEC-004 | P2 | S | `npm audit --omit=dev` shows zero High/Critical runtime vulnerabilities. |
| TC-SEC-005 | P2 | S | Content-Security-Policy header plan exists — even if not enforced in dev. |
| TC-SEC-006 | P3 | S | Clicking external links (if added later) sets `rel="noopener noreferrer"`. |

## Suite J — Error / edge cases

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-E-001 | P1 | F | Filter combo that yields 0 rows: KPIs show `0`, charts show empty states (not NaN%, not `--`). |
| TC-E-002 | P1 | F | Processor with 0 txns in window still appears on the baseline bar chart with Current=0. |
| TC-E-003 | P2 | F | Switching to a range < 2 days auto-switches the trend chart to hourly granularity. |
| TC-E-004 | P2 | F | Very narrow ranges (e.g. 1 hour, zero txns) do not divide by zero. |
| TC-E-005 | P2 | F | Rapid filter toggles (5× in 1s) don't produce stuck loading states or stale data. |
| TC-E-006 | P3 | F | Browser back after changing 3 filters goes back one change at a time (history correctness). |

## Suite K — Documentation & acceptance criteria

| ID | Priority | Type | Description |
| --- | --- | --- | --- |
| TC-DOC-001 | P1 | F | README contains: run instructions, data generation approach, key decisions, future improvements. |
| TC-DOC-002 | P1 | F | README includes at least one concrete insight (2–3 paragraphs) with a recommended business action. |
| TC-DOC-003 | P2 | F | `npm run dev` starts on port 3000 without additional configuration. |
| TC-DOC-004 | P2 | F | `npm run build` succeeds with zero errors. |
| TC-DOC-005 | P2 | F | `npm run typecheck` passes. |
| TC-DOC-006 | P2 | F | `npm run lint` passes (or warnings are documented). |
