## 2026-09-20T01:53:34Z
You are Milestone 0 Worker.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_worker_m0/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Survey 3 report: /home/mir/Documents/botock/.agents/teamwork_preview_explorer_survey_3/handoff.md

You MUST read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md before starting work.
Also read /home/mir/Documents/botock/.agents/rules/tool_architecture.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own:
- `/home/mir/Documents/botock/frontend/package.json`
- `/home/mir/Documents/botock/frontend/package-lock.json`
- `/home/mir/Documents/botock/frontend/next.config.ts`
Do not touch any other existing files.

TASK:
1. In `/home/mir/Documents/botock/frontend`, install the required client-side image processing packages:
   `npm install browser-image-compression pica @types/pica @imgly/background-removal onnxruntime-web`
   (Note: DO NOT install `react-image-file-resizer` as it has conflicting peer dependencies with React 19; `pica` is the designated high-performance Lanczos3 resizer).
2. Update `/home/mir/Documents/botock/frontend/next.config.ts` to add the Cross-Origin isolation headers specifically for the `/tools/image-remove-bg` route (COOP and COEP) as detailed in the Survey 3 report:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     async headers() {
       return [
         {
           source: "/tools/image-remove-bg",
           headers: [
             {
               key: "Cross-Origin-Opener-Policy",
               value: "same-origin",
             },
             {
               key: "Cross-Origin-Embedder-Policy",
               value: "require-corp",
             },
           ],
         },
       ];
     },
   };

   export default nextConfig;
   ```
3. Run `npm run build` in `/home/mir/Documents/botock/frontend` and verify that the build succeeds with exit code 0.
4. Document the commands executed and output in your handoff report at `/home/mir/Documents/botock/.agents/teamwork_preview_worker_m0/handoff.md`.
5. Send a completion message to the parent agent when finished.
