# Dispatch: worker_m4_registry
Target: Register pdf-to-word, word-to-pdf, and pdf-to-excel in ToolEngine.ts and update app/tools/page.tsx status to "active".

## 2026-09-21T01:29:47Z
Your working directory is /home/mir/Documents/botock/.agents/worker_m4_registry/.
Read:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md
- /home/mir/Documents/botock/.agents/orchestrator_4/SCOPE.md
- /home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md
- /home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission: Register the 3 new document conversion tools (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`) in `frontend/app/tools/ToolEngine.ts` and synchronize the tool catalog in `frontend/app/tools/page.tsx`.

You own exclusively:
- `frontend/app/tools/ToolEngine.ts`
- `frontend/app/tools/page.tsx`

Requirements:
1. In `frontend/app/tools/ToolEngine.ts`:
   - Register `pdf-to-word`, `word-to-pdf`, and `pdf-to-excel` using `ToolRegistry.registerTool`.
   - Adhere strictly to the AI-Agent-Ready Tool Schema:
     - `id`: exact tool IDs ("pdf-to-word", "word-to-pdf", "pdf-to-excel")
     - `name`: human-readable tool names
     - `description`: descriptive purpose of the tool
     - `category`: "pdf"
     - `seoTitle` and `seoDescription`
     - `endpoint`: "/api/convert/pdf-to-docx", "/api/convert/docx-to-pdf", "/api/convert/pdf-to-excel"
     - `isClientSideOnly`: false (since they are backend-powered via FastAPI)
     - `parameters`: comprehensive schema for the "file" parameter, accepted file extensions, MIME types, required: true.
2. In `frontend/app/tools/page.tsx`:
   - Update `tools` array so that `pdf-to-word`, `word-to-pdf`, and `pdf-to-excel` have `status: "active"`.
   - Ensure routes, names, descriptions, and icons are cleanly set up.
3. Verification:
   - Run typecheck in `frontend/` (`npx tsc --noEmit`) to verify zero errors.

Document all changes in `/home/mir/Documents/botock/.agents/worker_m4_registry/handoff.md` and send a message when complete.
