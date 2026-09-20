# Plan — 5 Client-Side Image Processing Tools

## Objective
Build and verify 5 client-side Image Processing tools in Next.js (`frontend`):
1. `image-resize`
2. `image-compress`
3. `image-remove-bg`
4. `image-to-webp`
5. `image-upscale`
Plus registration in `app/tools/ToolEngine.ts`.
Architecture:
- `page.tsx` (Server Component, metadata, SEO)
- `Client.tsx` (Client Component, logic, UI)
- `error.tsx` (Error boundary, isolation)
- 100% client-side, zero backend API calls, zero paid APIs.
- Build integrity: `npm run build` exits 0 with no errors.

## Strategy & Workflow
- Pattern: Project Pattern (Top-Level Orchestrator)
- Dual Track:
  - Implementation Track: Sub-orchestrators for tools & integration
  - E2E Testing Track: Opaque-box E2E test harness and test cases (Tiers 1-4)
- Verification Cycle: Explorer -> Worker -> Reviewer -> Challenger -> Auditor
- Strict Integrity Audit: Binary veto on any mock/cheat/hardcoded logic.

## Execution Steps
1. Phase 0: Survey codebase (3 parallel Explorers: codebase structure & image-crop pattern, dependencies & package.json, ToolEngine & UI components).
2. Phase 1: Synthesize PROJECT.md and TEST_INFRA.md.
3. Phase 2: Dispatch implementation milestones and test suite.
4. Phase 3: Run full verification, audit, and `npm run build`.
5. Phase 4: Generate completion report and handoff.
