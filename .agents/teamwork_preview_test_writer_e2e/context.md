# Context: E2E Test Writer

Target: Build comprehensive opaque-box test suite for the 5 client-side Image Processing tools in Botock frontend.
Reference documents:
- `/home/mir/Documents/botock/.agents/TEST_INFRA.md`
- `/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md`
- `/home/mir/Documents/botock/.agents/PROJECT.md`
- `/home/mir/Documents/botock/.agents/rules/tool_architecture.md`

Requirements:
- Create test suite implementing Tiers 1-4 (Tiers 1-4 test runner in `frontend/scripts/test-e2e.mjs` or `frontend/tests/`).
- Verify:
  - Page structure (`page.tsx`, `Client.tsx`, `error.tsx`)
  - SEO Metadata & JSON-LD schema
  - 100% Client-side execution (no external backend calls / zero paid APIs)
  - ToolEngine registration & parameters
  - Edge cases, error handling, boundary cases
- When complete, generate `/home/mir/Documents/botock/.agents/TEST_READY.md`.
