# Context: Reviewer 2 (Milestone 7 Verification)

You are Reviewer 2 for Milestone 7 (Full Verification & Audit) of the Botock Client-Side Image Suite.

Working directory: /home/mir/Documents/botock/.agents/reviewer_m7_2/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

Read these files before starting:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/PROJECT.md
- /home/mir/Documents/botock/.agents/TEST_READY.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Objective:
1. Verify 100% client-side privacy across all 5 image tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`) — zero external image APIs, zero server-side upload endpoints.
2. Verify Next.js COOP/COEP headers in `frontend/next.config.ts`.
3. Verify memory leak protection (`URL.revokeObjectURL`) in all Client components.
4. Execute the production build (`npm run build`) in `/home/mir/Documents/botock/frontend` and verify it exits with code 0.
5. Execute the strict E2E suite (`node scripts/test-e2e.mjs --strict`) in `/home/mir/Documents/botock/frontend` and verify all tests pass.
6. Produce a detailed handoff.md in your working directory with structured verdict: APPROVE or REQUEST_CHANGES.
