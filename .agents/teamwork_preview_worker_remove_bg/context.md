# Context: image-remove-bg Tool Worker

Target: Implement `image-remove-bg` at `/home/mir/Documents/botock/frontend/app/tools/image-remove-bg/`
Files:
- `page.tsx` (Server Component: SEO Metadata, JSON-LD Schema, dynamic import of Client with skeleton)
- `Client.tsx` (Client Component: react-dropzone, client-side `@imgly/background-removal`, progress bar / loading state, checkerboard transparency background preview, download PNG)
- `error.tsx` (Error boundary: crash isolation, reset button)

Reference implementation: `/home/mir/Documents/botock/frontend/app/tools/image-crop/`
Survey report: `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md`
Original request: `/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md`
Rules: `/home/mir/Documents/botock/.agents/rules/tool_architecture.md`
Note: `@imgly/background-removal` must be imported/called strictly on the client side (e.g. inside `removeBackground` call or dynamic import) so SSR does not fail.
