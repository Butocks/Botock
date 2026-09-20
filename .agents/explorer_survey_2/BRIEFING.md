# BRIEFING — 2026-09-20T18:51:00Z

## Mission
Deep technical investigation into 4 client-side Video Tools (video-trim, video-speed, video-to-mp3, video-compress) using @ffmpeg/ffmpeg in Next.js App Router.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, synthesizer
- Working directory: /home/mir/Documents/botock/.agents/explorer_survey_2
- Original parent: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Milestone: survey_video_tools

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT write or modify any source code files outside of .agents/explorer_survey_2/
- Output comprehensive survey to /home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md
- Adhere to Botock Tool Architecture Guidelines (.agents/rules/tool_architecture.md)

## Current Parent
- Conversation ID: ec2ec1b7-e1e8-4eb6-93bd-62f904fd2a69
- Updated: not yet

## Investigation State
- **Explored paths**: `frontend/package.json`, `frontend/next.config.ts`, `frontend/app/tools/ToolEngine.ts`, `frontend/app/tools/image-remove-bg/`, `frontend/app/tools/image-crop/`, `@ffmpeg/ffmpeg` v0.12+ documentation and WebAssembly APIs.
- **Key findings**:
  1. Single-threaded `@ffmpeg/core` is strictly recommended over `@ffmpeg/core-mt` to prevent Next.js App Router client-navigation crashes (`crossOriginIsolated=false`) and avoid breaking Supabase OAuth popups or CDN assets.
  2. Stream copy trimming (`video-trim`) is instant (<0.5s) on single-thread. Dual mode (Fast Lossless Cut vs Accurate Cut) provides the optimal user experience.
  3. Audio extraction (`video-to-mp3`) with `-vn` takes 1-3 seconds.
  4. Video speed (`video-speed`) requires chaining `atempo` for speeds <0.5x or >2.0x, with graceful handling for videos without audio tracks.
  5. Video compression (`video-compress`) with CRF (24-32), `-preset ultrafast`, and 720p/480p downscaling runs efficiently in WASM.
  6. Shared singleton manager (`FFmpegManager`) and custom hook (`useFFmpeg`) avoid redundant 31MB WASM downloads and handle progress/cleanup/cancellation cleanly.
  7. AI-agent-ready schemas defined for all 4 tools in `ToolEngine.ts`.
- **Unexplored areas**: None. Technical investigation fully completed.

## Key Decisions Made
- Recommending `@ffmpeg/core` (single-threaded) v0.12.6.
- Designing shared singleton manager (`ffmpegManager.ts`) + hook (`useFFmpeg.ts`).
- Specifying exact CLI arguments and memory safety protocols.

## Artifact Index
- `/home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md` — Detailed technical survey report on 4 Video Tools
- `/home/mir/Documents/botock/.agents/explorer_survey_2/handoff.md` — 5-component hard handoff report
- `/home/mir/Documents/botock/.agents/explorer_survey_2/progress.md` — Liveness heartbeat
- `/home/mir/Documents/botock/.agents/explorer_survey_2/DISPATCH.md` — Initial dispatch message
