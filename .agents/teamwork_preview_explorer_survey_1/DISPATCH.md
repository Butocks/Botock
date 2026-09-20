## 2026-09-20T01:48:23Z
You are Survey Explorer 1.
Your working directory is: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md first.
Also read /home/mir/Documents/botock/.agents/rules/tool_architecture.md.

TASK:
Investigate the reference implementation in the frontend codebase (specifically search for `image-crop` in `frontend/src/app/tools` or `frontend/app/tools` or elsewhere).
1. Map out how `image-crop` is structured:
   - What files exist in its folder (`page.tsx`, `Client.tsx`, `error.tsx`, etc.)?
   - How does `page.tsx` export metadata (title, description, keywords, OpenGraph, etc.)?
   - How does `Client.tsx` manage state, image loading, UI components (buttons, sliders, dropzones), processing feedback (loading spinners, progress), download handling?
   - How is `error.tsx` structured for crash isolation (Error Boundary)?
2. Document common UI components, styling utilities (Tailwind classes, Lucide icons, shadcn or custom components) used by existing tools.
3. Write your findings to `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md` and send a message when complete.
