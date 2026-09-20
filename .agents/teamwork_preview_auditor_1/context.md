# Context: Forensic Auditor

Role: Forensic integrity auditor.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_auditor_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Test suite readiness: /home/mir/Documents/botock/.agents/TEST_READY.md
Project plan: /home/mir/Documents/botock/.agents/PROJECT.md

Task:
Perform exhaustive forensic integrity auditing on all 5 image tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`) and integration files:
1. Static analysis:
   - Check for hardcoded test results, expected outputs, or verification strings in source code.
   - Check for dummy or facade implementations that mock processing without real client-side logic.
   - Check for any external backend API calls or paid third-party endpoints.
2. Code authenticity:
   - Verify genuine use of `pica` / Canvas in `image-resize`.
   - Verify genuine use of `browser-image-compression` in `image-compress`.
   - Verify genuine use of `@imgly/background-removal` in `image-remove-bg`.
   - Verify genuine use of Canvas API `toBlob` in `image-to-webp`.
   - Verify genuine use of multi-step canvas scaling & convolution kernel filtering in `image-upscale`.
3. Report verdict:
   - `Verdict: CLEAN` or `Verdict: INTEGRITY VIOLATION` in `/home/mir/Documents/botock/.agents/teamwork_preview_auditor_1/handoff.md`.
