# Botock Python FastAPI Backend — API Survey & Specification Report

**Generated Date**: 2026-09-21  
**Author**: Specification Miner  
**Primary Source File**: `/home/mir/Documents/botock/backend/main.py` (138 lines)  
**Target Backend URL**: `http://localhost:8000`

---

## 1. Executive Summary & Codebase Architecture

The Botock platform contains a dedicated document conversion backend built on **FastAPI**. 

### Repository Codebase Layout & Disambiguation:
In `/home/mir/Documents/botock/backend`, there are two FastAPI application files:
1. **`/home/mir/Documents/botock/backend/main.py`** (**Active Conversion Backend**):
   - FastAPI title: `"Botock Backend Tools API"`
   - Implements the three document conversion endpoints requested in `ORIGINAL_REQUEST.md`.
   - Actively running in the system under Uvicorn (`uvicorn main:app --reload --port 8000`).
   - Self-contained, lightweight, and directly handles PDF-to-DOCX, DOCX-to-PDF, and PDF-to-Excel.
2. **`/home/mir/Documents/botock/backend/app/main.py`** (AI Video / Image Backend):
   - FastAPI title: `"Botock Creative AI Platform"`
   - Handles video/image generation workflows (`app/routers/video.py`, `app/routers/image.py`).
   - Note: Frontend document conversion tools connect to `backend/main.py`.

---

## 2. Server Startup & Configuration

| Parameter | Specification | Details / Source Line |
|---|---|---|
| **Entrypoint** | `backend/main.py` | FastAPI instance defined at `backend/main.py:13` |
| **Startup Command** | `uvicorn main:app --reload --port 8000` | Process verified running from virtual environment `backend/venv` |
| **Default Host & Port** | `http://localhost:8000` | Bound to port 8000 |
| **Virtual Environment** | `/home/mir/Documents/botock/backend/venv` | Python 3.13 venv |
| **Dependencies (`requirements.txt`)** | `fastapi`, `uvicorn`, `python-multipart`, `pdf2docx`, `pdfplumber`, `pandas`, `openpyxl` | `/home/mir/Documents/botock/backend/requirements.txt` |
| **External CLI Dependencies** | `libreoffice` or `soffice` | Required by `/api/convert/docx-to-pdf` (checked via `shutil.which`) |

---

## 3. CORS Middleware Configuration

Configured in `/home/mir/Documents/botock/backend/main.py` lines 16–22:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### CORS Specifications:
- **Allowed Origins**: `["http://localhost:3000"]`
  - ⚠️ **Critical Frontend Note**: Requests originating from `http://127.0.0.1:3000` or other IP formats will be rejected by CORS. Next.js development server must be accessed via `http://localhost:3000`.
- **Allowed Credentials**: `True` (Supports cookies / credentials headers).
- **Allowed HTTP Methods**: `["*"]` (GET, POST, OPTIONS, etc.).
- **Allowed Request Headers**: `["*"]` (Accept, Content-Type, Authorization, etc.).
- **Preflight (OPTIONS)**: Automatically handled with 200 OK by FastAPI CORSMiddleware.

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Health | Root Status | Verifies backend operational status | None (HTTP GET `/`) | JSON `{"status": "ok", "message": "Botock Backend is running"}` | 500 on internal failure | `backend/main.py:24-26` |
| 2 | Conversion | PDF to DOCX | Converts PDF documents to editable Microsoft Word (.docx) files using `pdf2docx.Converter` | `multipart/form-data` with field `file` (`.pdf`) | Binary `.docx` stream (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) | 400 (not a PDF), 422 (missing file), 500 (conversion error) | `backend/main.py:28-51` |
| 3 | Conversion | PDF to Excel | Extracts tabular data across all pages of a PDF into multi-sheet Excel (.xlsx) workbooks using `pdfplumber` + `pandas` | `multipart/form-data` with field `file` (`.pdf`) | Binary `.xlsx` stream (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) | 400 (not a PDF or no tables found), 422 (missing file), 500 (conversion error) | `backend/main.py:53-94` |
| 4 | Conversion | DOCX to PDF | Converts Microsoft Word (.docx, .doc) files to PDF using headless LibreOffice / soffice CLI | `multipart/form-data` with field `file` (`.docx`, `.doc`) | Binary `.pdf` stream (`application/pdf`) | 400 (invalid ext), 422 (missing file), 501 (LibreOffice absent), 500 (CLI error) | `backend/main.py:96-138` |

---

## 5. Detailed Endpoint Specifications

### 5.1 Endpoint: `POST /api/convert/pdf-to-docx`
- **Location**: `backend/main.py:28-51`
- **HTTP Method**: `POST`
- **Route Path**: `/api/convert/pdf-to-docx`
- **URL**: `http://localhost:8000/api/convert/pdf-to-docx`
- **Request Formats**:
  - Request `Content-Type`: `multipart/form-data`
  - Form field parameter: `file` (FastAPI `UploadFile = File(...)`)
  - Supported extensions: `.pdf` (validated via `file.filename.lower().endswith('.pdf')`)
  - MIME-type validation: No explicit MIME check; validated by extension.
  - File size limit: No hard limit configured in Python; server system/memory limits apply.
- **Conversion Engine**: `pdf2docx.Converter`
- **Response Format**:
  - Response Class: `fastapi.responses.FileResponse`
  - HTTP Status: `200 OK`
  - Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Content-Disposition: `attachment; filename="<original_name>.docx"`
    - Note: Built using `file.filename.replace(".pdf", ".docx")`
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "File must be a PDF"}`
  - `422 Unprocessable Entity`: When `file` key is omitted:
    ```json
    {
      "detail": [
        {
          "type": "missing",
          "loc": ["body", "file"],
          "msg": "Field required",
          "input": null
        }
      ]
    }
    ```
  - `500 Internal Server Error`: `{"detail": "Conversion failed: <exception message>"}`

---

### 5.2 Endpoint: `POST /api/convert/docx-to-pdf`
- **Location**: `backend/main.py:96-138`
- **HTTP Method**: `POST`
- **Route Path**: `/api/convert/docx-to-pdf`
- **URL**: `http://localhost:8000/api/convert/docx-to-pdf`
- **Request Formats**:
  - Request `Content-Type`: `multipart/form-data`
  - Form field parameter: `file` (FastAPI `UploadFile = File(...)`)
  - Supported extensions: `.docx`, `.doc` (validated via `file.filename.lower().endswith(('.doc', '.docx'))`)
  - MIME-type validation: None in Python code.
  - File size limit: No hard limit configured in Python.
- **Conversion Engine**: Headless LibreOffice (`soffice` or `libreoffice` binary spawned asynchronously via `asyncio.create_subprocess_exec`)
  - Command executed: `<soffice_cmd> --headless --convert-to pdf --outdir <temp_dir> <temp_docx>`
- **Response Format**:
  - Response Class: `fastapi.responses.FileResponse`
  - HTTP Status: `200 OK`
  - Content-Type: `application/pdf`
  - Content-Disposition: `attachment; filename="<original_name>.pdf"`
    - Built using: `file.filename.rsplit('.', 1)[0] + ".pdf"`
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "File must be a Word document"}`
  - `422 Unprocessable Entity`: Missing form field `file`.
  - `501 Not Implemented`: `{"detail": "LibreOffice is not installed on the server"}`
  - `500 Internal Server Error`: 
    - `{"detail": "Conversion failed: LibreOffice conversion process failed"}`
    - `{"detail": "Conversion failed: Output PDF not found"}`
    - `{"detail": "Conversion failed: <exception message>"}`

---

### 5.3 Endpoint: `POST /api/convert/pdf-to-excel`
- **Location**: `backend/main.py:53-94`
- **HTTP Method**: `POST`
- **Route Path**: `/api/convert/pdf-to-excel`
- **URL**: `http://localhost:8000/api/convert/pdf-to-excel`
- **Request Formats**:
  - Request `Content-Type`: `multipart/form-data`
  - Form field parameter: `file` (FastAPI `UploadFile = File(...)`)
  - Supported extensions: `.pdf` (validated via `file.filename.lower().endswith('.pdf')`)
  - MIME-type validation: None in Python code.
  - File size limit: No hard limit configured in Python.
- **Conversion Engine**:
  - Reader: `pdfplumber.open(io.BytesIO(pdf_bytes))`
  - Processor: Loops through each page (`pdf.pages`), calls `page.extract_tables()`
  - Table to DataFrame: `pd.DataFrame(table[1:], columns=table[0])`
  - Sheet Writer: `openpyxl` engine, sheet named `P{page_idx+1}_T{t_idx+1}` (sliced to 31 chars max)
  - No Tables Guard: If no tables exist on any page, raises `400 Bad Request`.
- **Response Format**:
  - Response Class: `fastapi.responses.FileResponse`
  - HTTP Status: `200 OK`
  - Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Content-Disposition: `attachment; filename="<original_name>.xlsx"`
    - Built using: `file.filename.replace(".pdf", ".xlsx")`
- **Error Responses**:
  - `400 Bad Request` (Invalid file extension): `{"detail": "File must be a PDF"}`
  - `400 Bad Request` (No tabular data detected in PDF): `{"detail": "No tables found in the PDF"}`
  - `422 Unprocessable Entity`: Missing form field `file`.
  - `500 Internal Server Error`: `{"detail": "Conversion failed: <exception message>"}`

---

## 6. Edge Cases & Behavioral Analysis

| # | Feature | Input / Condition | Observed / Code Behavior | Impact on Frontend |
|---|---------|-------------------|--------------------------|--------------------|
| 1 | All Endpoints | Empty request / JSON body / missing `file` multipart field | FastAPI returns `422 Unprocessable Entity` with `{"detail": [{"loc": ["body", "file"], "msg": "Field required"}]}` | Frontend FormData MUST append with key `'file'`: `formData.append('file', file)`. |
| 2 | `pdf-to-docx` & `pdf-to-excel` | Filename with uppercase extension (e.g. `report.PDF`) | Extension check passes because of `.lower()`. However, `filename.replace(".pdf", ".docx")` is case-sensitive, which results in `report.PDF` -> `report.PDF` in the `Content-Disposition` header filename! | Frontend should ideally derive the download filename client-side as fallback: `originalName.replace(/\.[^/.]+$/, "") + ".docx"`. |
| 3 | `pdf-to-excel` | PDF containing only text or images (no identifiable tables) | `pdfplumber` finds 0 tables. Triggers `HTTPException(status_code=400, detail="No tables found in the PDF")`. | Frontend MUST display a clear user-friendly error message: "No tables found in the PDF. Make sure your PDF contains structured table grids." |
| 4 | `docx-to-pdf` | Server lacks LibreOffice (`soffice` binary) | Backend returns `501 Not Implemented` with `{"detail": "LibreOffice is not installed on the server"}`. | Frontend should check for status 501 and display: "Server configuration issue: LibreOffice is missing on backend." |
| 5 | CORS | Accessing backend from `http://127.0.0.1:3000` vs `http://localhost:3000` | Origin header `http://127.0.0.1:3000` is blocked by CORS because `allow_origins` strictly lists `["http://localhost:3000"]`. | Client must ensure base URL or browser origin is `http://localhost:3000`. |
| 6 | All Endpoints | Large PDF or DOCX file (e.g. >50MB) | Conversion may take 10–30+ seconds. Uvicorn default request timeout applies. | Frontend must show an active spinner/progress status and allow sufficient fetch timeout (do not abort prematurely). |

---

## 7. Frontend Integration Contract (Next.js / TypeScript)

### 7.1 Form-Data & Fetch Implementation Pattern

```typescript
export async function convertDocument(endpoint: string, file: File, fallbackFilename: string): Promise<Blob> {
  const formData = new FormData();
  // MUST be named 'file'
  formData.append("file", file);

  const response = await fetch(`http://localhost:8000${endpoint}`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header manually; fetch sets multipart/form-data boundary automatically.
  });

  if (!response.ok) {
    let errorMessage = "Conversion failed";
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        if (typeof errJson.detail === "string") {
          errorMessage = errJson.detail;
        } else if (Array.isArray(errJson.detail) && errJson.detail[0]?.msg) {
          errorMessage = errJson.detail[0].msg;
        }
      }
    } catch {
      errorMessage = `Server error (${response.status}: ${response.statusText})`;
    }
    throw new Error(errorMessage);
  }

  return await response.blob();
}
```

### 7.2 Triggering File Download in Browser

```typescript
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

### 7.3 Tool Engine Schema Mapping

| Frontend Tool ID | Route Path | Method | Expected Input Extension | Response MIME Type | Expected Output Extension |
|---|---|---|---|---|---|
| `pdf-to-word` | `/api/convert/pdf-to-docx` | `POST` | `.pdf` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |
| `word-to-pdf` | `/api/convert/docx-to-pdf` | `POST` | `.doc`, `.docx` | `application/pdf` | `.pdf` |
| `pdf-to-excel` | `/api/convert/pdf-to-excel` | `POST` | `.pdf` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` |

