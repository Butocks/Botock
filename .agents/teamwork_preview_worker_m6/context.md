# Context: Milestone 6 Integration Worker

Target:
1. Update `frontend/app/tools/ToolEngine.ts` to register all 5 tools:
   - `image-resize`
   - `image-compress`
   - `image-remove-bg`
   - `image-to-webp`
   - `image-upscale`
   Follow schemas detailed in Explorer 2 report `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_2/handoff.md`.
2. Update `frontend/app/tools/page.tsx`:
   - Add `image-upscale` to the `tools` array.
   - Set status to `"active"` for `image-crop`, `image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, and `image-upscale`.
3. Verify:
   - Run `node scripts/test-e2e.mjs --strict` in `frontend` (all 89 checks must pass with exit code 0).
   - Run `npm run build` in `frontend` (must exit 0 with all routes prerendered).
4. Write report to `.agents/teamwork_preview_worker_m6/handoff.md`.
