# Context: image-to-webp Tool Worker

Target: Implement `image-to-webp` at `/home/mir/Documents/botock/frontend/app/tools/image-to-webp/`
Files:
- `page.tsx` (Server Component: SEO Metadata, JSON-LD Schema, dynamic import of Client with skeleton)
- `Client.tsx` (Client Component: react-dropzone, Canvas API `toBlob(..., "image/webp", quality)`, quality slider, file size before/after comparison, preview, download)
- `error.tsx` (Error boundary: crash isolation, reset button)

Reference implementation: `/home/mir/Documents/botock/frontend/app/tools/image-crop/`
Survey report: `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md`
Original request: `/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md`
Rules: `/home/mir/Documents/botock/.agents/rules/tool_architecture.md`
