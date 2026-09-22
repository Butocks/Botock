# BRIEFING — 2026-09-21T01:18:00Z

## Mission
Survey and document the Python FastAPI backend in the repository, focusing on configuration, CORS, and the three conversion endpoints (/api/convert/pdf-to-docx, /api/convert/docx-to-pdf, /api/convert/pdf-to-excel).

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Specification Miner, External Domain Expert
- Working directory: /home/mir/Documents/botock/.agents/explorer_survey_backend/
- Original parent: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Milestone: Backend API Survey & Specification Mining

## 🔒 Key Constraints
- Read-only on codebase / Do NOT implement anything.
- Write only inside working directory (/home/mir/Documents/botock/.agents/explorer_survey_backend/).
- Document all findings with file paths, line numbers, and request/response specifications into survey_backend.md.
- Send summary message to caller parent (49b23d1b-4b16-4dea-b77b-e6fa46949290).

## Current Parent
- Conversation ID: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Updated: 2026-09-21T01:18:00Z

## Task Summary
- **What to build**: Full survey report (survey_backend.md) of the Python FastAPI backend conversion endpoints and setup.
- **Success criteria**: Detailed HTTP routes, form field names, accepted extensions/MIME/sizes, response types/headers, error structures/status codes, CORS settings, backend startup/configuration documented accurately.
- **Interface contracts**: FastAPI routes in `backend/main.py` and `frontend/app/tools/ToolEngine.ts`.
- **Code layout**: Backend directory in `/home/mir/Documents/botock/backend/main.py`.

## Key Decisions Made
- Identified `/home/mir/Documents/botock/backend/main.py` as the active document conversion API (currently running under uvicorn PID 4822).
- Mapped all 3 endpoints (`/api/convert/pdf-to-docx`, `/api/convert/docx-to-pdf`, `/api/convert/pdf-to-excel`) with form field `file`, response headers, error codes, and edge cases.
- Generated comprehensive `survey_backend.md` and `handoff.md`.

## Artifact Index
- survey_backend.md — Comprehensive backend API survey report
- handoff.md — Standard teamwork handoff report
- progress.md — Liveness heartbeat and progress tracking
- DISPATCH.md — Log of dispatch instructions
