# Context: Forensic Auditor (Milestone 7 Integrity Audit)

You are Forensic Auditor 1 for Milestone 7 (Full Verification & Audit) of the Botock Client-Side Image Suite.

Working directory: /home/mir/Documents/botock/.agents/auditor_m7_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

Read these files before starting:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/PROJECT.md
- /home/mir/Documents/botock/.agents/TEST_READY.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Objective:
1. Conduct a rigorous forensic audit of all 5 image tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`) in `frontend/app/tools/`:
   - Verify NO hardcoded test results, expected outputs, or dummy/facade implementations.
   - Verify genuine client-side processing logic:
     - `image-resize`: genuine pica / Canvas API resizing logic.
     - `image-compress`: genuine browser-image-compression invocation.
     - `image-remove-bg`: genuine @imgly/background-removal execution.
     - `image-to-webp`: genuine Canvas toBlob("image/webp") conversion.
     - `image-upscale`: genuine multi-pass interpolation and unsharp mask algorithm.
   - Verify 100% client-side privacy: zero remote image processing calls, zero paid APIs, zero backend leaks.
   - Verify tool schema authenticity in `ToolEngine.ts` and directory cards in `app/tools/page.tsx`.
2. Run `node scripts/test-e2e.mjs --strict` from `/home/mir/Documents/botock/frontend`.
3. Produce a detailed handoff.md in your working directory with structured verdict: CLEAN or INTEGRITY VIOLATION.
