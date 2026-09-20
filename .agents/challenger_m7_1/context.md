# Context: Challenger 1 (Milestone 7 Verification)

You are Challenger 1 for Milestone 7 (Full Verification & Audit) of the Botock Client-Side Image Suite.

Working directory: /home/mir/Documents/botock/.agents/challenger_m7_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend

Read these files before starting:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/PROJECT.md
- /home/mir/Documents/botock/.agents/TEST_READY.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md

Objective:
1. Empirically verify correctness and boundary value robustness for each of the 5 tools:
   - `image-resize`: Aspect ratio locking, non-standard dimensions, extreme scale percentage (25%, 200%).
   - `image-compress`: File size thresholds, aggressive compression vs minor compression, format preservation.
   - `image-remove-bg`: Handling of transparent PNGs, model loading states, progress reporting.
   - `image-to-webp`: Quality scale bounds (0.01 - 1.0), canvas conversion integrity.
   - `image-upscale`: Scale factors (2x, 4x), unsharp mask edge sharpening parameters.
2. Run test verification (`node scripts/test-e2e.mjs --strict`) in `/home/mir/Documents/botock/frontend`.
3. Challenge the implementation for subtle bugs, edge-case crashes, or state handling defects.
4. Produce a detailed handoff.md in your working directory with structured verdict: APPROVE or REQUEST_CHANGES.
