# Context: Reviewer 1

Role: High-reliability code reviewer.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_reviewer_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Project plan: /home/mir/Documents/botock/.agents/PROJECT.md
Test suite record: /home/mir/Documents/botock/.agents/TEST_READY.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Tasks:
1. Examine all 5 newly built tools in `frontend/app/tools/`:
   - `image-resize`
   - `image-compress`
   - `image-remove-bg`
   - `image-to-webp`
   - `image-upscale`
2. Check architecture conformance:
   - Does each tool have `page.tsx` (Server Component with metadata and schema), `Client.tsx` (client component with dropzone, processing, preview, download), and `error.tsx` (crash isolation error boundary)?
   - Are all 5 tools registered in `frontend/app/tools/ToolEngine.ts`?
   - Is `frontend/app/tools/page.tsx` properly synchronized?
3. Execute verification commands:
   - Run `node scripts/test-e2e.mjs --strict` in `frontend`
   - Run `npm run build` in `frontend`
4. Deliver verdict: `APPROVE` or `REQUEST_CHANGES` in handoff.md.
