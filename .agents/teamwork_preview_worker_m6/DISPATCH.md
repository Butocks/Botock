## 2026-09-20T02:09:14Z

You are Milestone 6 Integration Worker.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_m6/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Survey 2 report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_2/handoff.md
Test runner: /home/mir/Documents/botock/frontend/scripts/test-e2e.mjs
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own:
- `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
- `/home/mir/Documents/botock/frontend/app/tools/page.tsx`
- Your .agents directory.
Do not edit any other files.

TASK:
1. In `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`:
   Register all 5 image tools using `ToolRegistry.registerTool({ ... })`:
   - `image-resize`: category "image", parameters (image [file], width [number], height [number], percentage [number], maintainAspectRatio [boolean]), isClientSideOnly: true, endpoint: "/tools/image-resize".
   - `image-compress`: category "image", parameters (image [file], maxSizeMB [number], quality [number]), isClientSideOnly: true, endpoint: "/tools/image-compress".
   - `image-remove-bg`: category "image", parameters (image [file]), isClientSideOnly: true, endpoint: "/tools/image-remove-bg".
   - `image-to-webp`: category "image", parameters (image [file], quality [number]), isClientSideOnly: true, endpoint: "/tools/image-to-webp".
   - `image-upscale`: category "image", parameters (image [file], scaleFactor [number]), isClientSideOnly: true, endpoint: "/tools/image-upscale".
   (Refer to Survey 2 report for exact schema specifications and parameter details).
2. In `/home/mir/Documents/botock/frontend/app/tools/page.tsx`:
   - Add the missing `image-upscale` card to the `tools` array.
   - Update `status` to `"active"` for `image-crop`, `image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, and `image-upscale` so that they display as live in the UI directory.
3. Verification:
   - Run `node scripts/test-e2e.mjs --strict` from `/home/mir/Documents/botock/frontend`. Ensure all 89 checks pass with 0 failures and exit code 0.
   - Run `npm run build` from `/home/mir/Documents/botock/frontend`. Ensure production build exits with code 0.
4. Document commands and outputs in your handoff report at `/home/mir/Documents/botock/.agents/teamwork_preview_worker_m6/handoff.md`.
5. Send a message to parent when complete.
