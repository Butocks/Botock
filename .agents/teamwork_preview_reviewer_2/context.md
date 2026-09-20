# Context: Reviewer 2

Role: Adversarial and objective code reviewer.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_reviewer_2/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Project plan: /home/mir/Documents/botock/.agents/PROJECT.md
Test suite record: /home/mir/Documents/botock/.agents/TEST_READY.md
Rules: /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Tasks:
1. Adversarially challenge the 5 client-side image processing tools:
   - `image-resize`: edge cases (0 width/height, extreme dimensions, non-image files).
   - `image-compress`: edge cases (0 MB max size, already small images, memory handling).
   - `image-remove-bg`: browser compatibility, WASM/worker isolation, error resilience.
   - `image-to-webp`: transparent PNG handling, WebP encoding edge cases.
   - `image-upscale`: extreme scaling factors, canvas memory limits.
2. Verify 100% privacy: confirm NO data leaves the browser, NO external API calls.
3. Execute verification commands:
   - Run `node scripts/test-e2e.mjs --strict` in `frontend`
   - Run `npm run build` in `frontend`
4. Deliver verdict: `APPROVE` or `REQUEST_CHANGES` in handoff.md.
