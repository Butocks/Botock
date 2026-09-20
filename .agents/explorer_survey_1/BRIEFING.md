# BRIEFING — 2026-09-20T18:50:20Z

## Mission
Survey the existing Next.js frontend codebase to establish baseline architecture, conventions, and dependencies for adding 6 new tools.

## 🔒 My Identity
- Archetype: explorer
- Roles: survey, analysis, synthesis
- Working directory: /home/mir/Documents/botock/.agents/explorer_survey_1/
- Original parent: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Milestone: baseline frontend architecture survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code
- Adhere to tool architecture guidelines in `.agents/rules/tool_architecture.md`
- Output report in `/home/mir/Documents/botock/.agents/explorer_survey_1/survey_report.md` and `handoff.md`

## Current Parent
- Conversation ID: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Updated: 2026-09-20T18:50:20Z

## Investigation State
- **Explored paths**: `frontend/package.json`, `frontend/app/tools/image-crop/`, `frontend/app/tools/ToolEngine.ts`, `frontend/app/tools/page.tsx`, `frontend/next.config.ts`, `frontend/app/components/`, `frontend/tsconfig.json`, `frontend/app/globals.css`, baseline `npm run build`
- **Key findings**:
  1. Next.js 16.3.5 (Turbopack, App Router) + React 19.2.8 + Tailwind v4.
  2. `pdf-lib` is already installed; missing `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `@ffmpeg/core`, `tesseract.js`, `pdfjs-dist`.
  3. Standard 3-file pattern established: `page.tsx` (RSC + metadata + SoftwareApplication JSON-LD + dynamic import), `Client.tsx` (interactive UI + dropzone + progress + preview + download), `error.tsx` (isolated crash boundary).
  4. ToolEngine registry has 11 tools; needs all 6 new tools registered.
  5. `next.config.ts` has COOP/COEP only for image-remove-bg; video tools can either use single-threaded `@ffmpeg/core` or add scoped COOP/COEP headers.
  6. Shared UI components live in `frontend/app/components/` and are platform-level; tools build UI self-contained with Tailwind classes and `react-dropzone`.
  7. Baseline `npm run build` passes with exit code 0.
- **Unexplored areas**: None for survey scope.

## Key Decisions Made
- Documented full baseline survey in `survey_report.md` and hard handoff in `handoff.md`.

## Artifact Index
- DISPATCH.md — incoming instructions
- progress.md — liveness heartbeat
- survey_report.md — detailed survey report
- handoff.md — structured handoff report
