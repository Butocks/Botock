## 2026-09-20T19:20:43Z
You are worker_m4, an implementation worker subagent for Milestone 4 (Platform Registration & UI Consistency).
Your working directory is: /home/mir/Documents/botock/.agents/worker_m4/
The project root is: /home/mir/Documents/botock
The frontend directory is: /home/mir/Documents/botock/frontend
The user request document is: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Tool architecture rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md
Project specification: /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md

MANDATORY FIRST STEP: Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md, /home/mir/Documents/botock/.agents/rules/tool_architecture.md, and /home/mir/Documents/botock/.agents/orchestrator_3/PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You have exclusive write ownership of:
- `frontend/app/tools/ToolEngine.ts`
- `frontend/app/tools/page.tsx`
Do NOT write to files outside this list.

YOUR OBJECTIVE:
1. Register all 6 new tools in `frontend/app/tools/ToolEngine.ts`:
   - `video-trim` (Category: `"video"`)
   - `video-speed` (Category: `"video"`)
   - `video-to-mp3` (Category: `"video"`)
   - `video-compress` (Category: `"video"`)
   - `pdf-ocr` (Category: `"pdf"`)
   - `pdf-compress` (Category: `"pdf"`)
   Ensure each registration has:
   - Full AI-agent-ready schema detailing inputs, parameter types, bounds, defaults, descriptions, and outputs.
   - `isClientSideOnly: true`
   - `endpoint: "/tools/[tool-name]"`
   - `seoTitle`, `seoDescription`
2. Update `frontend/app/tools/page.tsx`:
   - Ensure the tools catalog / directory lists all 6 new tools with status `"active"`, appropriate category ("Video" and "PDF"), icons, description, and link to their `/tools/[tool-name]` route.
3. Verification:
   - Run `npx tsc --noEmit` in `frontend/` to confirm zero TypeScript errors.
   - Run `npm run build` in `frontend/` to verify the Next.js production build exits with code 0 and all tool pages are statically generated / prerendered cleanly.
4. Document full findings in `handoff.md` in your working directory and notify parent via `send_message`.
