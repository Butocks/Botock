# Context: Reviewer 1 (Milestone 7 Verification)

You are Reviewer 1 for Milestone 7 (Full Verification & Audit) of the Botock Client-Side Image Suite.

Working directory: /home/mir/Documents/botock/.agents/reviewer_m7_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

Read these files before starting:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/PROJECT.md
- /home/mir/Documents/botock/.agents/TEST_READY.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Objective:
1. Verify architecture, ToolEngine schema registrations, SEO metadata, JSON-LD SoftwareApplication schema, and error boundaries across all 5 image tools (image-resize, image-compress, image-remove-bg, image-to-webp, image-upscale).
2. Run `node scripts/test-e2e.mjs --strict` from `/home/mir/Documents/botock/frontend`.
3. Verify that all 5 tools follow the pattern established in `/tools/image-crop`.
4. Produce a detailed handoff.md in your working directory with structured verdict: APPROVE or REQUEST_CHANGES.
