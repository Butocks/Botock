# Dispatch: test_writer_conversion
Target: Build opaque-box E2E test suite for the 3 document conversion tools.

## 2026-09-21T01:21:14Z
Your working directory is /home/mir/Documents/botock/.agents/test_writer_conversion/.
Read:
- /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
- /home/mir/Documents/botock/.agents/rules/tool_architecture.md
- /home/mir/Documents/botock/.agents/orchestrator_4/SCOPE.md
- /home/mir/Documents/botock/.agents/spec_miner_requirements/requirements_spec.md
- /home/mir/Documents/botock/.agents/explorer_survey_backend/survey_backend.md

Mission: Design and construct a comprehensive opaque-box E2E test suite for the 3 document conversion tools:
1. `pdf-to-word` (POST /api/convert/pdf-to-docx)
2. `word-to-pdf` (POST /api/convert/docx-to-pdf)
3. `pdf-to-excel` (POST /api/convert/pdf-to-excel)

Do NOT modify any implementation code in frontend/app/. You own test files in `frontend/tests/` (e.g. `frontend/tests/e2e-conversion.test.mjs` or `frontend/scripts/test-conversion-e2e.mjs`).

Coverage Requirements (Tiers 1-4, minimum 38 test cases total):
- Tier 1: Feature Coverage (>=5 test cases per tool = 15 total):
  - File existence and exports for page.tsx, Client.tsx, error.tsx across all 3 tools.
  - SEO Metadata validation (title, description, OpenGraph, keywords).
  - Schema.org SoftwareApplication JSON-LD validation.
  - Dropzone configuration and accepted MIME types / file extensions (.pdf for pdf-to-word & pdf-to-excel; .docx/.doc for word-to-pdf).
  - Presence of download mechanism and binary blob handling.
- Tier 2: Boundary & Corner Cases (>=5 test cases per tool = 15 total):
  - Rejection of invalid file types and oversized files.
  - Missing file parameter handling (422 response parsing).
  - Empty file / 0-byte upload handling.
  - Server error handling (500 response handling).
  - Specific error cases: 400 "No tables found in the PDF" for pdf-to-excel; 501 LibreOffice missing for word-to-pdf.
  - Network disconnection / unreachable backend handling.
- Tier 3: Cross-Feature & Configuration (>=3 test cases):
  - ToolEngine schema registration validation for all 3 tools (id, name, endpoint, isClientSideOnly: false, parameters).
  - Directory grid sync in app/tools/page.tsx.
- Tier 4: Real-World Scenarios (>=5 test cases):
  - Full simulated PDF to DOCX upload -> multipart fetch -> blob download flow.
  - Full simulated Word to PDF upload -> multipart fetch -> blob download flow.
  - Full simulated PDF to Excel upload -> multipart fetch -> blob download flow.
  - API Base URL resolution: respects process.env.NEXT_PUBLIC_API_URL and defaults to http://localhost:8000.
  - Memory cleanup verification (URL.revokeObjectURL).

Write the test runner script, execute it to verify its execution, and publish `/home/mir/Documents/botock/.agents/test_writer_conversion/TEST_READY.md`.
Update progress.md and send a message when complete.
