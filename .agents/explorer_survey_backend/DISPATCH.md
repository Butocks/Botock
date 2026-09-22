## 2026-09-21T01:15:29Z

Your working directory is /home/mir/Documents/botock/.agents/explorer_survey_backend/.
Read /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md.

Mission: Find and examine the Python FastAPI backend codebase in /home/mir/Documents/botock (or wherever it is located in the repository).
Investigate the FastAPI app setup and the conversion endpoints:
1. /api/convert/pdf-to-docx
2. /api/convert/docx-to-pdf
3. /api/convert/pdf-to-excel

Specifically investigate and detail:
- Exact HTTP methods, route paths, URL structure.
- Request form field names (e.g. UploadFile parameter name: 'file', etc.).
- Accepted file extensions, MIME types, and size limits.
- Response content types (e.g. docx, pdf, xlsx MIME types).
- Response headers (e.g. Content-Disposition filename formatting).
- Error status codes and error response JSON structure (e.g., 400, 422, 500).
- CORS middleware settings (allowed origins, headers, methods).
- How the backend is started/configured.

Document all findings with file paths, line numbers, and request/response specifications into /home/mir/Documents/botock/.agents/explorer_survey_backend/survey_backend.md.
Update your progress.md and send a message with your summary when complete.
