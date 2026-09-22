# Dispatch: explorer_survey_frontend
Target: Investigate frontend architecture, existing tools pattern, ToolEngine, UI libraries, and conventions.

## 2026-09-21T01:15:30Z
Investigate the Next.js frontend in /home/mir/Documents/botock/frontend to identify architectural patterns, existing tool implementations, and shared utilities.

Specifically investigate and detail:
1. Existing tool implementations in frontend/app/tools/ (reference image-crop, image-resize, etc.):
   - Structure of page.tsx: metadata, JSON-LD SoftwareApplication schema, dynamic import of Client with skeleton.
   - Structure of Client.tsx: UI layout, react-dropzone usage, states (idle, converting, error, success), progress/spinners, binary blob handling and download triggers.
   - Structure of error.tsx: React error boundary implementation.
2. frontend/app/tools/ToolEngine.ts:
   - ToolSchema interface, parameter definitions, registry methods, and how tools are categorized.
3. frontend/app/tools/page.tsx:
   - Tool directory grid, categories, status badges, routing.
4. Dependencies and styling:
   - Available UI libraries (Lucide icons, Tailwind classes, components in frontend/components/).
   - API base URL convention (e.g. NEXT_PUBLIC_API_URL or environment variables or default http://localhost:8000).

Document all findings with component patterns, file paths, and code examples into /home/mir/Documents/botock/.agents/explorer_survey_frontend/survey_frontend.md.
Update your progress.md and send a message with your summary when complete.
