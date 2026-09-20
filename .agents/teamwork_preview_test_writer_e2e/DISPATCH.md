## 2026-09-20T01:57:37Z
You are the E2E Test Writer (`teamwork_preview_test_writer`).
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_test_writer_e2e/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Test infra plan: /home/mir/Documents/botock/.agents/TEST_INFRA.md
Project specification: /home/mir/Documents/botock/.agents/PROJECT.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

EXCLUSIVE WRITE OWNERSHIP:
You own:
- `frontend/scripts/*` (e.g. `frontend/scripts/test-e2e.mjs`)
- `frontend/tests/*`
- `/home/mir/Documents/botock/.agents/TEST_READY.md`
- Your .agents directory.
Do NOT edit the tool implementation source files.

TASK:
Design and write a comprehensive, opaque-box E2E test suite covering Tiers 1-4 for the Botock Client-Side Image Suite:
1. Create a standalone Node.js test script (e.g. `frontend/scripts/test-e2e.mjs`):
   - Tier 1 (Feature Coverage, >=5 per feature):
     - Check file existence for `page.tsx`, `Client.tsx`, `error.tsx` across all 5 tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`).
     - Check SEO metadata export (`title`, `description`, `openGraph`) in each `page.tsx`.
     - Check JSON-LD `SoftwareApplication` structured data in each `page.tsx`.
     - Check `use client` directive and React error boundary structure in each `error.tsx`.
     - Check dynamic import with loading skeleton in each `page.tsx`.
     - Check `react-dropzone` integration in each `Client.tsx`.
     - Check client-side processing API usage (pica/canvas, browser-image-compression, @imgly/background-removal, toBlob WebP, canvas interpolation).
   - Tier 2 (Boundary & Corner Cases):
     - Check privacy & client-side isolation: verify no fetch/axios/XMLHttpRequest to external backend image processing APIs.
     - Check error resilience: verify error boundary exports `reset` function and catches failures.
     - Check header configuration in `next.config.ts` for Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy.
     - Check file types supported in accept configurations (JPEG, PNG, WEBP).
   - Tier 3 (Cross-Feature Combinations & ToolEngine Registry):
     - Verify `frontend/app/tools/ToolEngine.ts` exports `ToolRegistry`.
     - Verify all 5 tools have `ToolRegistry.registerTool(...)` entries with required fields (`id`, `name`, `description`, `category: "image"`, `isClientSideOnly: true`, `endpoint`, `parameters`).
     - Verify parameter definitions for each tool.
   - Tier 4 (Real-World Scenarios & Build Verification):
     - Run Next.js build verification check or AST verification that all routes compile.
     - Validate tool catalog in `frontend/app/tools/page.tsx` for tool links and status.
2. Run the test script and ensure tests execute with detailed console output and exit code 0 when everything passes.
3. Write `/home/mir/Documents/botock/.agents/TEST_READY.md` containing:
   - Test runner command (`node scripts/test-e2e.mjs`).
   - Coverage summary by tier.
   - Feature checklist.
4. Report results in `/home/mir/Documents/botock/.agents/teamwork_preview_test_writer_e2e/handoff.md` and send a message when done.
