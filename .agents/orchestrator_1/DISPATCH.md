# DISPATCH

## 2026-09-20T01:47:42Z
You are the Project Orchestrator (teamwork_preview_orchestrator).

Working directory: /home/mir/Documents/botock/.agents/orchestrator_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

Original request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md

Please read the original request carefully:
You are requested to launch multiple agents to build and verify 5 client-side Image Processing tools in Next.js (React) concurrently:
1. `image-resize` (using `react-image-file-resizer` or `pica`)
2. `image-compress` (using `browser-image-compression`)
3. `image-remove-bg` (using `@imgly/background-removal`)
4. `image-to-webp` (using Canvas API)
5. `image-upscale` (using a client-side upscaling method or standard high-quality interpolation via canvas)

Adhere to Architecture Guidelines:
- Follow the design pattern established in `/tools/image-crop`.
- Each tool must have a `page.tsx` (Server Component) for SEO.
- Each tool must have a `Client.tsx` (Client Component) for the logic.
- Each tool must have an `error.tsx` for crash isolation.
- Register all 5 tools in `app/tools/ToolEngine.ts`.
- Ensure tool isolation & crash resilience (never crash the platform).
- Thorough local verification: Run `npm run build` in `/home/mir/Documents/botock/frontend` and ensure 0 errors. Ensure 100% client-side execution (no paid or backend APIs).

Maintain your `plan.md`, `progress.md`, and `BRIEFING.md` in your working directory.
When completed, report back with your completion summary and handoff.
