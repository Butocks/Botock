# BRIEFING — 2026-09-20T01:50:50Z

## Mission
Investigate the reference implementation (`image-crop`) in the frontend codebase to understand tool structure, metadata exports, client state management, UI components, crash isolation (`error.tsx`), and common UI/styling conventions.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, reporter
- Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1
- Original parent: 8cbc3124-6506-4a70-9d3c-53b14f2fe10c
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Must read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- Must read /home/mir/Documents/botock/.agents/rules/tool_architecture.md
- Output findings in handoff.md following 5-component handoff report

## Current Parent
- Conversation ID: 8cbc3124-6506-4a70-9d3c-53b14f2fe10c
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `/home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md`
  - `/home/mir/Documents/botock/.agents/rules/tool_architecture.md`
  - `/home/mir/Documents/botock/frontend/app/tools/image-crop/page.tsx`
  - `/home/mir/Documents/botock/frontend/app/tools/image-crop/ImageCropClient.tsx`
  - `/home/mir/Documents/botock/frontend/app/tools/image-crop/error.tsx`
  - `/home/mir/Documents/botock/frontend/app/tools/pdf-merge/`
  - `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`
  - `/home/mir/Documents/botock/frontend/app/tools/page.tsx`
  - `/home/mir/Documents/botock/frontend/app/globals.css`
  - `/home/mir/Documents/botock/frontend/package.json`
- **Key findings**:
  - `image-crop` is composed of 3 files: `page.tsx`, `ImageCropClient.tsx`, and `error.tsx`.
  - `page.tsx` exports Next.js `Metadata`, injects `application/ld+json` schema markup, and uses `next/dynamic` with loading spinner.
  - `ImageCropClient.tsx` manages state (`image`, `croppedImage`, `aspectRatio`), uses `react-dropzone` for drag-drop image input, displays a two-column responsive grid layout with editing canvas on the left and process/result actions on the right, and download anchor.
  - `error.tsx` is an isolated `"use client"` React error boundary with `error` and `reset` props, logging error and offering a "Try Again" recovery button.
  - No shadcn library is installed; UI components are clean, bespoke Tailwind CSS classes with `lucide-react` icons.
  - Baseline `npm run build` succeeds (code 0) with Turbopack and static prerendering for `/tools/image-crop`.
- **Unexplored areas**: None for this survey task.

## Key Decisions Made
- Fully documented structure, code patterns, and UI conventions into `handoff.md`.

## Artifact Index
- /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_1/handoff.md — Complete 5-component survey handoff report
