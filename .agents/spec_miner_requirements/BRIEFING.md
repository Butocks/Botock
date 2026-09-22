# BRIEFING — 2026-09-21T01:20:00Z

## Mission
Extract, formalize, and document all explicit and implicit requirements for the 3 document conversion tools (pdf-to-word, word-to-pdf, pdf-to-excel) adhering to Tool Architecture Guidelines, UX requirements, ToolEngine registration, and acceptance criteria.

## 🔒 My Identity
- Archetype: specification_miner
- Roles: Specification Miner, Teamwork specialist
- Working directory: /home/mir/Documents/botock/.agents/spec_miner_requirements
- Original parent: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Milestone: Document Conversion Tools Requirements Specification

## 🔒 Key Constraints
- Read-only on implementation code (do NOT implement anything).
- Prioritize authoritative sources over LLM prior knowledge.
- Discover and document everything (including edge cases and discovered related features).
- Write only to .agents/spec_miner_requirements/.
- Adhere strictly to /home/mir/Documents/botock/.agents/rules/tool_architecture.md.
- Follow 5-component handoff report protocol.

## Current Parent
- Conversation ID: 49b23d1b-4b16-4dea-b77b-e6fa46949290
- Updated: 2026-09-21T01:20:00Z

## Task Summary
- **What to build**: Comprehensive requirements specification for pdf-to-word, word-to-pdf, and pdf-to-excel tools.
- **Success criteria**: Full specification documented in `requirements_spec.md` with features, edge cases, ToolEngine schema, UX, isolation, SEO, error handling, and acceptance criteria.
- **Interface contracts**: Tool Architecture Guidelines, ToolEngine.ts interface, FastAPI endpoints.
- **Code layout**: Next.js App Router (frontend/app/tools/[tool-name]/page.tsx, Client.tsx, error.tsx), ToolEngine.ts.

## Key Decisions Made
- Analyzed backend endpoint contracts from authoritative source (`backend/main.py`).
- Extracted exact client-side UX flows, state machines, dropzone MIME filtering, and blob download lifecycles.
- Specified ToolEngine.ts registrations for all 3 tools with typed parameters and outputs, setting `isClientSideOnly: false`.
- Defined full Error Handling matrix, Features Discovered table, Edge Cases table, and Acceptance Criteria.
- Generated `requirements_spec.md` and complete 5-component `handoff.md`.

## Artifact Index
- /home/mir/Documents/botock/.agents/spec_miner_requirements/DISPATCH.md — Initial dispatch assignment
- /home/mir/Documents/botock/.agents/spec_miner_requirements/BRIEFING.md — Situational awareness
- /home/mir/Documents/botock/.agents/spec_miner_requirements/progress.md — Liveness & task progress
- /home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md — Target specification document
- /home/mir/Documents/botock/.agents/spec_miner_requirements/handoff.md — Final handoff report
