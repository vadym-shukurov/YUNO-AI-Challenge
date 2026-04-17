# Test Plan · Jakarta Smart Routing Dashboard

| Field | Value |
| --- | --- |
| Product | Yuno Payment Orchestration Dashboard (Jakarta Smart Routing Blackbox challenge) |
| Version under test | `main` working tree as of 2026-04-17 |
| Author | Principal QA (acting) |
| Test window | Static (code-level) round 1; dynamic round to follow once a dev server and browser are available |

## 1. Objectives

1. Verify the product meets the acceptance criteria for the KasaKini use case — routing distribution, drill-down, and anomaly highlighting.
2. Find defects that would undermine Dimas's trust in the dashboard ("black box" failures — silently wrong numbers, stale filters, missed anomalies).
3. Produce a reusable, automation-ready test catalog the team can re-run in CI once a test harness lands.

## 2. Scope

### In-scope
- Functional behavior of `useFilters`, `useProcessedData`, and derived widgets (charts, alerts, table, drawer).
- URL-state contract (shareable deep links via `?range`, `?from`, `?to`, `?method`).
- Mock data generator correctness against the spec (counts, distributions, anomaly window).
- Non-functional: responsiveness (breakpoints), performance (render cost at 600 rows), accessibility (keyboard, ARIA, contrast), and basic security posture (XSS, injection, sensitive data leaks).

### Out-of-scope (this round)
- Real backend integration — the product uses an in-memory generator only.
- Cross-browser compatibility beyond evergreen Chrome/Safari/Firefox.
- i18n / localization beyond IDR currency formatting.
- Load / soak testing — dataset is bounded to 600 rows.

## 3. Test approach

| Layer | Technique | Tooling (recommended) |
| --- | --- | --- |
| Spec compliance | Requirements-to-code traceability matrix | This document + code review |
| Pure logic | Unit tests of `generateMockData`, `useProcessedData` aggregators, `deriveRoutingDetails` | Vitest + Testing Library hooks |
| Component behavior | Interaction tests (filter toggles, row click → sheet, sort, paginate, search) | React Testing Library + user-event |
| E2E user journeys | Playwright against `npm run dev` | Playwright |
| Visual regression | Snapshot the three charts under stable fixtures | Playwright screenshots / Chromatic |
| Accessibility | Automated a11y scan per route + manual keyboard traversal | axe-core + manual |
| Security | Static scan + manual review of URL params, XSS surfaces, secret leaks | `npm audit`, manual |

This round is **static**: no dev server, no browser. All findings are traced to specific file/line references. Dynamic verification is queued for round 2.

## 4. Risk-based prioritization

| Risk | Likelihood | Impact | Priority tests |
| --- | --- | --- | --- |
| Table and charts disagree numerically (data source drift) | High | Critical — destroys trust | TC-D-001, TC-D-002 |
| Custom date range silently broken | High | High — blocks investigation | TC-F-011, TC-F-012 |
| Anomaly under-triggering / over-triggering | Medium | Critical — either misses incidents or cries wolf | TC-A-001..005 |
| Filter state desync across components | Medium | High | TC-F-021..024 |
| Mobile users blocked | High on tablet/phone | Medium | TC-N-031..032 |
| Accessibility regressions (keyboard, contrast) | Medium | Medium-High | TC-A11Y-001..006 |
| Sensitive data in URL/logs | Low | High | TC-S-001..003 |

## 5. Entry & exit criteria

**Entry (round 1, static):** code builds cleanly; spec in hand; file tree stable.

**Exit (round 2, dynamic):**
- All P0/P1 test cases executed and passing (or waived with documented justification).
- Zero open P0 defects; P1 defects triaged with target fix version.
- Lighthouse performance ≥ 85 on `/` under cold cache at desktop viewport.
- axe-core scan returns zero serious/critical violations.

## 6. Deliverables

1. This Test Plan.
2. Test Cases catalog ([test-cases.md](./test-cases.md)).
3. Test Execution Report with defect log ([test-execution-report.md](./test-execution-report.md)).
4. Automation stubs (follow-up — not in this round).
