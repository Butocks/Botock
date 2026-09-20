## 2026-09-20T01:48:23Z

<USER_REQUEST>
You are Survey Explorer 2.
Your working directory is: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_2/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md first.
Also read /home/mir/Documents/botock/.agents/rules/tool_architecture.md.

TASK:
Investigate `ToolEngine.ts` and tool registry across the project:
1. Locate `ToolEngine.ts` (e.g. `frontend/src/app/tools/ToolEngine.ts` or `frontend/app/tools/ToolEngine.ts`).
2. Examine the exact interface/types for tool registration:
   - What properties are required per tool (id, name, description, path, category, icon, tags, schema, etc.)?
   - What categories exist (e.g. 'image', etc.)?
   - How is `image-crop` or other tools registered in `ToolEngine.ts`?
   - How are tool schemas structured to meet the AI-Agent-Ready Tool Schema rule in `tool_architecture.md`?
3. List any other files or registries that need updating when adding new tools (e.g. navigation, sitemaps, category listings).
4. Write your findings to `/home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_2/handoff.md` and send a message when complete.
</USER_REQUEST>
