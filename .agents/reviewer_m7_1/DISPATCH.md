## 2026-09-20T03:10:46Z
You are Reviewer 1 (Architecture & Schema Reviewer) for Milestone 7 (Full Verification & Audit) of the Botock Client-Side Image Suite.

Your working directory is: /home/mir/Documents/botock/.agents/reviewer_m7_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

MANDATORY FIRST STEP: Read the original user request at:
/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md

Also read:
- /home/mir/Documents/botock/.agents/PROJECT.md
- /home/mir/Documents/botock/.agents/TEST_READY.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md
- /home/mir/Documents/botock/.agents/reviewer_m7_1/context.md

Tasks:
1. Verify the architecture and interface contracts of all 5 image tools in frontend/app/tools/:
   - image-resize (page.tsx, Client.tsx, error.tsx)
   - image-compress (page.tsx, Client.tsx, error.tsx)
   - image-remove-bg (page.tsx, Client.tsx, error.tsx)
   - image-to-webp (page.tsx, Client.tsx, error.tsx)
   - image-upscale (page.tsx, Client.tsx, error.tsx, upscaler.ts)
2. Verify that each tool satisfies:
   - Server Component page.tsx exporting metadata and JSON-LD SoftwareApplication schema.
   - Dynamic import with loading spinner/skeleton.
   - Client Component Client.tsx with drag-drop, processing, preview, download.
   - error.tsx React Error Boundary with user reset.
   - Schema registered in frontend/app/tools/ToolEngine.ts.
   - Listed as active in frontend/app/tools/page.tsx.
3. Run the strict E2E test suite in frontend:
   node scripts/test-e2e.mjs --strict
4. Document all findings and write your final handoff.md in /home/mir/Documents/botock/.agents/reviewer_m7_1/handoff.md.
Include a clear, unambiguous verdict: APPROVE or REQUEST_CHANGES.
Notify your parent when complete.
