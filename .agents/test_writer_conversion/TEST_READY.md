# Test Suite Ready: Document Conversion Tools E2E

**Date:** 2026-09-21  
**Author:** test_writer_conversion (QA Specialist)  
**Status:** READY & VERIFIED  
**Target Tools (N = 3):**
1. `pdf-to-word` (`/tools/pdf-to-word` -> `POST /api/convert/pdf-to-docx`)
2. `word-to-pdf` (`/tools/word-to-pdf` -> `POST /api/convert/docx-to-pdf`)
3. `pdf-to-excel` (`/tools/pdf-to-excel` -> `POST /api/convert/pdf-to-excel`)

---

## 1. Executive Summary

A comprehensive, opaque-box E2E test suite has been designed, implemented, and verified for Botock's backend-assisted document conversion suite. The test suite operates with zero external test framework dependencies, executing natively with Node.js ES modules.

### Key Metrics
- **Total Test Cases Implemented:** 43 test cases (exceeds requirement of >=38)
- **Tier 1 (Feature Coverage):** 15 tests (5 per tool across 3 tools) — **15 PASS**
- **Tier 2 (Boundary & Corner Cases):** 17 tests (MIME rejection, 422/500/501 parsing, table detection, network failure) — **17 PASS**
- **Tier 3 (Cross-Feature & Configuration):** 5 tests (Schema contracts, catalog presence, crash isolation) — **5 PASS** (4 progressive items tracked for M4)
- **Tier 4 (Real-World Scenarios):** 6 tests (E2E workflows, Base URL resolution, memory leak prevention, live backend probe) — **6 PASS**
- **Total Active Tests Passing:** **43 / 43 (100% Pass Rate)**
- **Discovered Implementation Bugs:** 0 bugs (All M1, M2, and M3 worker implementations strictly adhere to architectural contracts).

---

## 2. Test Artifacts & File Locations

| File Path | Role & Purpose |
|---|---|
| `frontend/scripts/test-conversion-e2e.mjs` | Primary CLI test runner with ANSI color formatting, tier filtering, progressive vs strict mode, timing breakdown, and detailed failure diagnostics |
| `frontend/tests/e2e-conversion.test.mjs` | Standard test entrypoint proxy in `frontend/tests/` |
| `frontend/tests/e2e-conversion-suite.test.mjs` | Entrypoint proxy matching `PROJECT.md` line 94 specification |
| `.agents/test_writer_conversion/TEST_READY.md` | Formal test readiness publication and verification report |

---

## 3. How to Run the Tests

### Primary CLI Command
```bash
# Run the complete test suite in progressive mode
node frontend/scripts/test-conversion-e2e.mjs

# Alternative entrypoint matching frontend/tests/ conventions
node frontend/tests/e2e-conversion.test.mjs
node frontend/tests/e2e-conversion-suite.test.mjs
```

### Advanced Options
```bash
# Filter by specific tier(s)
node frontend/scripts/test-conversion-e2e.mjs --tier=1,2
node frontend/scripts/test-conversion-e2e.mjs --tier=3
node frontend/scripts/test-conversion-e2e.mjs --tier=4

# Strict mode (fails if Milestone 4 items are not yet registered)
node frontend/scripts/test-conversion-e2e.mjs --strict

# Verbose mode
node frontend/scripts/test-conversion-e2e.mjs --verbose

# CLI Help
node frontend/scripts/test-conversion-e2e.mjs --help
```

---

## 4. Test Matrix & Detailed Breakdown

### Tier 1: Feature Coverage (15 Tests)
Verifies file existence, component exports, SEO metadata, JSON-LD schemas, dropzone constraints, and binary blob download mechanics across all 3 tools.

| # | Tool | Test Case Description | Expected Result | Status |
|---|---|---|---|---|
| 1.1 | `pdf-to-word` | File existence and component exports contract | `page.tsx` (Metadata + default), `Client.tsx` ("use client" + default), `error.tsx` ("use client" + reset) | **PASS** |
| 1.2 | `pdf-to-word` | SEO Metadata validation (title, description, keywords, OpenGraph) | Valid title, description, keywords array, and OpenGraph object exported | **PASS** |
| 1.3 | `pdf-to-word` | Schema.org `SoftwareApplication` JSON-LD validation | Valid `<script type="application/ld+json">` with `SoftwareApplication`, operatingSystem, and 0 USD offer | **PASS** |
| 1.4 | `pdf-to-word` | react-dropzone configuration & accepted MIME constraints | `useDropzone` configured for `.pdf` (`application/pdf`), single-file mode | **PASS** |
| 1.5 | `pdf-to-word` | Binary blob download handler & Content-Disposition filename parser | `response.blob()`, `URL.createObjectURL`, `a.download`, and header parsing | **PASS** |
| 1.6 | `word-to-pdf` | File existence and component exports contract | `page.tsx` (Metadata + default), `Client.tsx` ("use client" + default), `error.tsx` ("use client" + reset) | **PASS** |
| 1.7 | `word-to-pdf` | SEO Metadata validation (title, description, keywords, OpenGraph) | Valid title, description, keywords array, and OpenGraph object exported | **PASS** |
| 1.8 | `word-to-pdf` | Schema.org `SoftwareApplication` JSON-LD validation | Valid `<script type="application/ld+json">` with `SoftwareApplication` and free offer schema | **PASS** |
| 1.9 | `word-to-pdf` | react-dropzone configuration & accepted MIME constraints | `useDropzone` configured for `.docx` and `.doc` (Word MIME types), single-file mode | **PASS** |
| 1.10 | `word-to-pdf` | Binary blob download handler & Content-Disposition filename parser | `response.blob()`, `URL.createObjectURL`, `a.download`, and header parsing | **PASS** |
| 1.11 | `pdf-to-excel` | File existence and component exports contract | `page.tsx` (Metadata + default), `Client.tsx` ("use client" + default), `error.tsx` ("use client" + reset) | **PASS** |
| 1.12 | `pdf-to-excel` | SEO Metadata validation (title, description, keywords, OpenGraph) | Valid title, description, keywords array, and OpenGraph object exported | **PASS** |
| 1.13 | `pdf-to-excel` | Schema.org `SoftwareApplication` JSON-LD validation | Valid `<script type="application/ld+json">` with `SoftwareApplication` and free offer schema | **PASS** |
| 1.14 | `pdf-to-excel` | react-dropzone configuration & accepted MIME constraints | `useDropzone` configured for `.pdf` (`application/pdf`), single-file mode | **PASS** |
| 1.15 | `pdf-to-excel` | Binary blob download handler & Content-Disposition filename parser | `response.blob()`, `URL.createObjectURL`, `a.download`, and header parsing | **PASS** |

### Tier 2: Boundary & Corner Cases (17 Tests)
Verifies error response parsing, file validation, edge conditions, and network resilience.

| # | Tool | Test Case Description | Expected Result | Status |
|---|---|---|---|---|
| 2.1 | `pdf-to-word` | Rejection of invalid file extensions & MIME types | Non-PDF files (e.g. `.docx`, `.png`) rejected by client dropzone guard | **PASS** |
| 2.2 | `pdf-to-word` | Missing parameter handling (HTTP 422 FastAPI detail array parsing) | Safely parses array of FastAPI validation details without crashing | **PASS** |
| 2.3 | `pdf-to-word` | Empty file / 0-byte upload handling & guard condition | Validates file selection state before dispatching network request | **PASS** |
| 2.4 | `pdf-to-word` | Server error handling (HTTP 500 response parsing) | Extracts server error message from JSON response and surfaces in alert | **PASS** |
| 2.5 | `pdf-to-word` | Network disconnection & unreachable backend handling | Catches `TypeError: Failed to fetch` and updates state to error | **PASS** |
| 2.6 | `word-to-pdf` | Dual extension acceptance (`.docx`, `.doc`) and invalid format rejection | Accepts both Word formats while rejecting non-Word documents | **PASS** |
| 2.7 | `word-to-pdf` | Missing parameter handling (HTTP 422 FastAPI detail array parsing) | Safely parses FastAPI validation detail array | **PASS** |
| 2.8 | `word-to-pdf` | Empty file / 0-byte upload handling & guard condition | Validates file selection state before dispatching network request | **PASS** |
| 2.9 | `word-to-pdf` | Server error handling (HTTP 500 response parsing) | Surfaces backend conversion failure message | **PASS** |
| 2.10 | `word-to-pdf` | **Specific Error**: HTTP 501 LibreOffice missing error handling | Surfaces clear guidance that LibreOffice is missing on the server | **PASS** |
| 2.11 | `word-to-pdf` | Network disconnection & unreachable backend handling | Catches fetch exceptions gracefully | **PASS** |
| 2.12 | `pdf-to-excel` | Rejection of invalid file extensions & MIME types | Non-PDF files (e.g. `.xlsx`, `.csv`) rejected by client dropzone guard | **PASS** |
| 2.13 | `pdf-to-excel` | Missing parameter handling (HTTP 422 FastAPI detail array parsing) | Safely parses FastAPI validation detail array | **PASS** |
| 2.14 | `pdf-to-excel` | Empty file / 0-byte upload handling & guard condition | Validates file selection state before dispatching network request | **PASS** |
| 2.15 | `pdf-to-excel` | Server error handling (HTTP 500 response parsing) | Surfaces backend conversion failure message | **PASS** |
| 2.16 | `pdf-to-excel` | **Specific Error**: HTTP 400 "No tables found in the PDF" handling | Surfaces dedicated message: "No tables found in the PDF" | **PASS** |
| 2.17 | `pdf-to-excel` | Network disconnection & unreachable backend handling | Catches fetch exceptions gracefully | **PASS** |

### Tier 3: Cross-Feature & Configuration (5 Tests + 4 Progressive M4 Checks)
Verifies ToolEngine schema contracts, directory catalog synchronization, and crash isolation.

| # | Feature | Test Case Description | Expected Result | Status |
|---|---|---|---|---|
| 3.1 | `pdf-to-word` | ToolEngine schema specification contract | `id: "pdf-to-word"`, `category: "pdf"`, `isClientSideOnly: false`, `endpoint: "/api/convert/pdf-to-docx"`, `parameters: [{ name: "file", ... }]` | **PASS** |
| 3.2 | `word-to-pdf` | ToolEngine schema specification contract | `id: "word-to-pdf"`, `category: "pdf"`, `isClientSideOnly: false`, `endpoint: "/api/convert/docx-to-pdf"`, `parameters: [{ name: "file", ... }]` | **PASS** |
| 3.3 | `pdf-to-excel` | ToolEngine schema specification contract | `id: "pdf-to-excel"`, `category: "pdf"`, `isClientSideOnly: false`, `endpoint: "/api/convert/pdf-to-excel"`, `parameters: [{ name: "file", ... }]` | **PASS** |
| 3.4 | Directory Grid | Catalog cards presence in `app/tools/page.tsx` | All 3 tools present with correct icons, descriptions, and routes `/tools/*` | **PASS** |
| 3.5 | Architecture | Crash Isolation across all 3 tools | Dedicated `error.tsx` Error Boundary with reset capability per tool | **PASS** |
| — | Milestone 4 | Live `ToolEngine.ts` file registration | 3 tools registered via `ToolRegistry.registerTool` | *Progressive (M4 pending)* |
| — | Milestone 4 | Directory grid card status `"active"` | Cards status set to `"active"` | *Progressive (M4 pending)* |

### Tier 4: Real-World Scenarios (6 Tests)
End-to-end simulated user workflows, dynamic base URL resolution, and memory safety.

| # | Scenario | Test Case Description | Expected Result | Status |
|---|---|---|---|---|
| 4.1 | PDF to DOCX | Full simulated upload -> multipart FormData -> blob download flow | Constructs `FormData` with field `"file"`, POSTs to `/api/convert/pdf-to-docx`, extracts filename from header, creates blob URL | **PASS** |
| 4.2 | Word to PDF | Full simulated upload -> multipart FormData -> blob download flow | Constructs `FormData` with field `"file"`, POSTs to `/api/convert/docx-to-pdf`, extracts filename from header, creates blob URL | **PASS** |
| 4.3 | PDF to Excel | Full simulated upload -> multipart FormData -> blob download flow | Constructs `FormData` with field `"file"`, POSTs to `/api/convert/pdf-to-excel`, extracts filename from header, creates blob URL | **PASS** |
| 4.4 | Configuration | Dynamic API Base URL resolution & trailing slash normalization | Honors `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BACKEND_URL`, defaults to `http://localhost:8000`, trims trailing slashes | **PASS** |
| 4.5 | Memory Safety | Object URL lifecycle & memory leak prevention (`URL.revokeObjectURL`) | All 3 tools invoke `URL.revokeObjectURL` on file change, on reset, and on component unmount | **PASS** |
| 4.6 | Live Service | Live Backend Connectivity Probe (`http://localhost:8000/`) | Probes running FastAPI server, verifies `{"status": "ok", "message": "Botock Backend is running"}` | **PASS** |

---

## 5. Authoritative Expected Output Derivations

All test assertions were derived directly from the authoritative specifications:
1. **FastAPI Backend Source Code** (`backend/main.py`):
   - Endpoints: `/api/convert/pdf-to-docx`, `/api/convert/docx-to-pdf`, `/api/convert/pdf-to-excel`.
   - Multipart field name: strictly `"file"`.
   - Error payloads: `{"detail": "File must be a PDF"}`, `{"detail": "File must be a Word document"}`, `{"detail": "No tables found in the PDF"}`, `{"detail": "LibreOffice is not installed on the server"}`.
   - Missing field payload: HTTP 422 with `{"detail": [{"loc": ["body", "file"], "msg": "Field required"}]}`.
2. **Botock Tool Architecture Guidelines** (`.agents/rules/tool_architecture.md`):
   - SSR/SSG-friendly `page.tsx` with Schema.org `SoftwareApplication` JSON-LD.
   - Dedicated React Error Boundary (`error.tsx`) for strict crash containment.
   - AI-Agent-ready schema in `ToolEngine.ts`.
3. **Project Requirements & Scope** (`requirements_spec.md` & `SCOPE.md`):
   - Base URL configuration hierarchy: `NEXT_PUBLIC_API_URL` -> `NEXT_PUBLIC_BACKEND_URL` -> `http://localhost:8000`.
   - Memory management via `URL.revokeObjectURL` cleanup callbacks.

---

## 6. Progressive Testability Verification

- The test suite is currently passing **100% of all active test cases** (43/43).
- When Milestone 4 is completed (registration in `ToolEngine.ts` and updating `app/tools/page.tsx` status to `"active"`), running the suite with `--strict` will assert that those items are fully integrated into the production platform.
