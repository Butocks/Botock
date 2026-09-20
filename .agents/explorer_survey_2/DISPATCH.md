## 2026-09-20T18:46:14Z

You are explorer_survey_2, an exploration subagent.
Your working directory is: /home/mir/Documents/botock/.agents/explorer_survey_2/
The project root is: /home/mir/Documents/botock
The frontend directory is: /home/mir/Documents/botock/frontend
The user request document is: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Tool architecture rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

MANDATORY FIRST STEP: Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md and /home/mir/Documents/botock/.agents/rules/tool_architecture.md before doing anything else.

YOUR MISSION:
Perform a deep technical investigation into the 4 client-side Video Tools:
1. `video-trim`: Fast stream copy trimming (`@ffmpeg/ffmpeg`)
2. `video-speed`: Alter playback speed (`@ffmpeg/ffmpeg`)
3. `video-to-mp3`: Audio extraction (`@ffmpeg/ffmpeg`)
4. `video-compress`: Reduce file size (`@ffmpeg/ffmpeg`)

INVESTIGATE & DOCUMENT:
1. How `@ffmpeg/ffmpeg` (v0.12+) works in Next.js 14/15 App Router on the client. How to load `@ffmpeg/core` (or `@ffmpeg/core-mt`), load WASM binaries, pass blobs/files using `fetchFile`, execute commands, track progress callbacks, read output files, and create download URLs.
2. The trade-offs between `@ffmpeg/core` (single-threaded, no SharedArrayBuffer needed, no COOP/COEP header complications) vs `@ffmpeg/core-mt` (multi-threaded, requires SharedArrayBuffer and strict COOP/COEP headers). Recommend the most robust, crash-resilient approach for Botock that works cleanly in production.
3. The exact FFmpeg CLI command flags for each tool:
   - `video-trim`: `-ss [start] -to [end] -i input.mp4 -c copy output.mp4` (or re-encode if keyframes require it, analyze stream copy vs re-encoding).
   - `video-speed`: video filter `setpts=(1/SPEED)*PTS`, audio filter `atempo=SPEED` (handling speeds like 0.5x, 0.75x, 1.25x, 1.5x, 2.0x, chain atempo if > 2.0x).
   - `video-to-mp3`: `-i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3`.
   - `video-compress`: `-i input.mp4 -vcodec libx264 -crf [28-32] -preset fast output.mp4` (and resolution downscaling options e.g. 720p).
4. Edge cases & error handling: Large files (>100MB / >500MB browser memory limit), corrupted files, unsupported codecs, WASM memory exhaustion, progress tracking (0-100%), cancellation / aborting running jobs, memory cleanup (`ffmpeg.deleteFile`).
5. Recommended shared helper/hook (e.g. `useFFmpeg` or singleton/lazy loader) so all 4 tools share WASM loading logic cleanly without code duplication.

CONSTRAINTS:
- You are strictly READ-ONLY. Do NOT write or modify any source code files.
- Write your findings to `/home/mir/Documents/botock/.agents/explorer_survey_2/survey_report.md`.
- Include a progress.md heartbeat in your working directory.
- When finished, send a message to parent summarizing your findings and pointing to your report.
