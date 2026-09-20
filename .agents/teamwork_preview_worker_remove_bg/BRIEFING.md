# BRIEFING — 2026-09-20T02:08:00Z

## Mission
Implement complete client-side AI Background Remover (`image-remove-bg`) tool in frontend/app/tools/image-remove-bg/ with SEO metadata, JSON-LD, @imgly/background-removal client-side processing, progress/loading UI, checkerboard preview, download, error boundary, and emerald styling.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg
- Original parent: 8cbc3124-6506-4a70-9d3c-53b14f2fe10c
- Milestone: image-remove-bg implementation

## 🔒 Key Constraints
- Exclusive write ownership: frontend/app/tools/image-remove-bg/* and .agents/teamwork_preview_worker_remove_bg/
- No fake/dummy/facade code - genuine implementation using @imgly/background-removal
- Dynamic import of @imgly/background-removal strictly in client/browser context
- Must include page.tsx, Client.tsx, error.tsx
- Emerald accent styling, dark-theme compatibility, Lucide icons matching /tools/image-crop
- Full test and build verification before handoff

## Current Parent
- Conversation ID: 8cbc3124-6506-4a70-9d3c-53b14f2fe10c
- Updated: 2026-09-20T02:08:00Z

## Task Summary
- **What to build**: Next.js client-side AI Background Remover tool page with page.tsx, Client.tsx, error.tsx
- **Success criteria**: Genuine @imgly/background-removal execution, dropzone, progress tracking, transparent PNG preview & download, error boundary, passes npm run build / tests / lint.
- **Interface contracts**: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- **Code layout**: frontend/app/tools/image-remove-bg/

## Change Tracker
- **Files modified**:
  - `frontend/app/tools/image-remove-bg/page.tsx` — Server component with SEO metadata, JSON-LD, and dynamic client loader.
  - `frontend/app/tools/image-remove-bg/Client.tsx` — Client component with dropzone, dynamic @imgly/background-removal call, model quality selector, real-time progress bar/status, checkerboard transparency preview, download CTA, and start over.
  - `frontend/app/tools/image-remove-bg/error.tsx` — Isolated Next.js error boundary with reset button.
- **Build status**: Pass (npm run build exited with code 0, prerendered route `○ /tools/image-remove-bg`).
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (`npm run build` and `npx tsc --noEmit` exited code 0).
- **Lint status**: Pass (`npx eslint app/tools/image-remove-bg/` exited code 0, 0 errors, 0 warnings).
- **Tests added/modified**: Static route generation test and build verification confirmed.

## Loaded Skills
- None

## Key Decisions Made
- Dynamic import of `@imgly/background-removal` inside `handleProcess` in `Client.tsx` ensures browser-only execution without WASM/worker SSR errors.
- Checkerboard preview combines repeating-conic-gradient and radial-gradient patterns for crisp visibility in both light and dark modes.

## Artifact Index
- /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/DISPATCH.md — Dispatch instructions
- /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/BRIEFING.md — Situational awareness
- /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/progress.md — Progress heartbeat
- /home/mir/Documents/botock/.agents/teamwork_preview_worker_remove_bg/handoff.md — Final handoff report
