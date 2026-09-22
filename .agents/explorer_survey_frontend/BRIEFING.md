# BRIEFING — 2026-09-21T01:19:30Z

## Mission
Investigate Next.js frontend in frontend/ to identify architectural patterns, existing tool implementations, ToolEngine registration, UI libraries, and conventions for backend-powered tools.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer
- Working directory: /home/mir/Documents/botock/.agents/explorer_survey_frontend
- Original parent: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Milestone: backend-frontend-integration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Investigate frontend architecture, page.tsx, Client.tsx, error.tsx, ToolEngine.ts, tools/page.tsx, components, styling, API base URL
- Document all findings in survey_frontend.md and handoff.md

## Current Parent
- Conversation ID: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Updated: 2026-09-21T01:19:30Z

## Investigation State
- **Explored paths**: `frontend/app/tools/` (image-crop, image-resize, pdf-compress, pdf-ocr, video-to-mp3, etc.), `frontend/app/tools/ToolEngine.ts`, `frontend/app/tools/page.tsx`, `frontend/utils/runtime-urls.ts`, `frontend/app/globals.css`, `frontend/package.json`, `frontend/next.config.ts`, `backend/main.py`.
- **Key findings**: Established full 3-file pattern (`page.tsx`, `Client.tsx`, `error.tsx`). Documented JSON-LD SoftwareApplication schema, dropzone pattern, backend fetch with multipart FormData, binary blob download, and memory cleanup (`URL.revokeObjectURL`). Identified `ToolEngine.ts` schema with `isClientSideOnly: false` and category `"pdf"`. Identified existing `"ready"` entries in `tools/page.tsx`. Identified backend URL fallback behavior and CORS alignment (`http://localhost:3000`). Verified clean build (`npm run build` exits 0).
- **Unexplored areas**: None for frontend survey.

## Key Decisions Made
- Detailed complete architectural survey in `survey_frontend.md`.
- Recommended explicit fallback to `http://localhost:8000` for backend tools due to `getBackendUrl()` defaulting to `window.location.origin` (port 3000) when env var is omitted.

## Artifact Index
- survey_frontend.md — Detailed frontend survey report
- handoff.md — 5-component handoff report
- progress.md — Liveness heartbeat
