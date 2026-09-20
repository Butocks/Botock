# Context: image-upscale Tool Worker

Target: Implement `image-upscale` at `/home/mir/Documents/botock/frontend/app/tools/image-upscale/`
Files:
- `page.tsx` (Server Component: SEO Metadata, JSON-LD Schema, dynamic import of Client with skeleton)
- `Client.tsx` (Client Component: react-dropzone, high-quality Canvas bicubic smoothing and unsharp mask sharpening, scale factor selector [2x, 4x], resolution before/after display, preview, download)
- `error.tsx` (Error boundary: crash isolation, reset button)

Reference implementation: `/home/mir/Documents/botock/frontend/app/tools/image-crop/`
Survey report: `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md`
Original request: `/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md`
Rules: `/home/mir/Documents/botock/.agents/rules/tool_architecture.md`
