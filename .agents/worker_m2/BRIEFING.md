# BRIEFING — 2026-09-21T00:02:45+05:00

## Mission
Implement the complete, production-ready Video Tools Suite (video-trim, video-speed, video-to-mp3, video-compress) in Botock frontend adhering to all tool architecture and SEO standards.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /home/mir/Documents/botock/.agents/worker_m2
- Original parent: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Milestone: Milestone 2 (Video Tools Suite)

## 🔒 Key Constraints
- Exclusive write ownership:
  - `frontend/app/tools/video-trim/` (`page.tsx`, `Client.tsx`, `error.tsx`)
  - `frontend/app/tools/video-speed/` (`page.tsx`, `Client.tsx`, `error.tsx`)
  - `frontend/app/tools/video-to-mp3/` (`page.tsx`, `Client.tsx`, `error.tsx`)
  - `frontend/app/tools/video-compress/` (`page.tsx`, `Client.tsx`, `error.tsx`)
- Do NOT write to any files outside these directories (except `.agents/worker_m2/`).
- Follow exact design pattern of `app/tools/image-crop/`.
- No fake/mock implementations; real FFmpeg WASM processing via `@/lib/ffmpeg/useFFmpeg`.
- Zero TypeScript and build errors (`npm run build` or `npx tsc --noEmit`).

## Current Parent
- Conversation ID: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Updated: 2026-09-21T00:02:45+05:00

## Task Summary
- **What to build**: 4 video tools (video-trim, video-speed, video-to-mp3, video-compress). Each having page.tsx (SSR/SSG SEO + JSON-LD), error.tsx (Crash isolation), and Client.tsx (interactive UI + FFmpeg WASM processing).
- **Success criteria**: All 4 tools fully functional, drag-and-drop, video preview, interactive parameter controls, progress bar, error handling, memory cleanup, TypeScript clean, Next.js build passes.
- **Interface contracts**: PROJECT.md & tool_architecture.md
- **Code layout**: frontend/app/tools/<tool-name>/

## Key Decisions Made
- [Initial] Follow `image-crop` reference architecture for layout, styling with Tailwind, Lucide icons, and useFFmpeg hook integration.

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Working memory & state
- progress.md — Liveness & progress tracker
- handoff.md — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Pending
