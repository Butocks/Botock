# Handoff Report: Python FastAPI Backend Survey

## 1. Observation
1. **Active FastAPI Backend File**: Located at `/home/mir/Documents/botock/backend/main.py`. It initializes FastAPI with `app = FastAPI(title="Botock Backend Tools API")` (line 13).
2. **CORS Middleware Settings** (`backend/main.py:16-22`):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. **Endpoint 1: PDF to Word (`/api/convert/pdf-to-docx`)** (`backend/main.py:28-51`):
   - Method: `@app.post("/api/convert/pdf-to-docx")`
   - Form Parameter: `file: UploadFile = File(...)`
   - Validation: `if not file.filename.lower().endswith('.pdf'): raise HTTPException(status_code=400, detail="File must be a PDF")`
   - Processing: `cv = Converter(in_path); cv.convert(out_path, start=0, end=None); cv.close()`
   - Output: `FileResponse(out_path, filename=file.filename.replace(".pdf", ".docx"), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")`
4. **Endpoint 2: PDF to Excel (`/api/convert/pdf-to-excel`)** (`backend/main.py:53-94`):
   - Method: `@app.post("/api/convert/pdf-to-excel")`
   - Form Parameter: `file: UploadFile = File(...)`
   - Validation: `if not file.filename.lower().endswith('.pdf'): raise HTTPException(status_code=400, detail="File must be a PDF")`
   - Processing: `pdfplumber.open(io.BytesIO(pdf_bytes))` extracting tables to pandas DataFrame, written to Excel using `openpyxl`. If `not tables_found`, raises `HTTPException(status_code=400, detail="No tables found in the PDF")`.
   - Output: `FileResponse(out_path, filename=file.filename.replace(".pdf", ".xlsx"), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")`
5. **Endpoint 3: Word to PDF (`/api/convert/docx-to-pdf`)** (`backend/main.py:96-138`):
   - Method: `@app.post("/api/convert/docx-to-pdf")`
   - Form Parameter: `file: UploadFile = File(...)`
   - Validation: `if not file.filename.lower().endswith(('.doc', '.docx')):` -> 400 "File must be a Word document".
   - Dependency check: `if not shutil.which("libreoffice") and not shutil.which("soffice"): raise HTTPException(status_code=501, detail="LibreOffice is not installed on the server")`
   - Processing: `soffice_cmd, "--headless", "--convert-to", "pdf", "--outdir", out_dir, in_path` via `asyncio.create_subprocess_exec`.
   - Output: `FileResponse(out_path, filename=file.filename.rsplit('.', 1)[0] + ".pdf", media_type="application/pdf")`
6. **Running Process**: `ps aux` confirms `mir 4822 ... /home/mir/Documents/botock/backend/venv/bin/python3 ./venv/bin/uvicorn main:app --reload --port 8000` is currently active on port 8000.

## 2. Logic Chain
1. By examining the directory structure, two FastAPI applications were found: `backend/app/main.py` (AI video generator) and `backend/main.py` (conversion endpoints).
2. Process inspection confirmed `uvicorn main:app --reload --port 8000` is running from `backend/`, which maps directly to `backend/main.py`.
3. Reading `backend/main.py` lines 1 to 138 establishes all route signatures, parameters, accepted formats, error responses, and CORS settings.
4. Line-by-line inspection confirms:
   - Form field for all 3 endpoints is named `'file'`.
   - Extensions checked via `.lower().endswith(...)`: `.pdf` for pdf-to-docx and pdf-to-excel; `.doc` and `.docx` for docx-to-pdf.
   - Missing fields yield standard FastAPI 422 JSON validation errors.
   - Specific custom errors are 400 Bad Request, 501 Not Implemented (for LibreOffice), and 500 Internal Server Error (wrapped in `{"detail": "Conversion failed: ..."}`).
   - Responses are binary `FileResponse` with specific MIME types and filename headers.

## 3. Caveats
- Case sensitivity quirk: `filename.replace(".pdf", ".docx")` in `pdf-to-docx` and `pdf-to-excel` will not replace uppercase extensions like `.PDF`. Frontend should safely infer the output filename using regex or fallback naming.
- Temporary files created during conversion are stored in system temp (`/tmp`), and background cleanup is currently commented out in `backend/main.py:48`.
- CORS is locked to `http://localhost:3000`. Accessing via `http://127.0.0.1:3000` will be blocked by CORS unless the origin matches.

## 4. Conclusion
The FastAPI backend is fully specified, self-contained, and currently running on port 8000. Frontend developers can immediately integrate all three tools (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`) by sending POST `multipart/form-data` with form field `'file'` and handling binary blob responses and `{"detail": "..."}` error structures. All specifications have been cataloged in `/home/mir/Documents/botock/.agents/explorer_survey_backend/survey_backend.md`.

## 5. Verification Method
1. Inspect `/home/mir/Documents/botock/backend/main.py` lines 16–138 to verify route signatures and CORS settings.
2. Read the full survey document at `/home/mir/Documents/botock/.agents/explorer_survey_backend/survey_backend.md`.
3. Check running backend process with `ps aux | grep uvicorn`.
