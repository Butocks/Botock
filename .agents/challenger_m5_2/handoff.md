# Empirical Challenger Verification & Adversarial Audit Report

**Agent**: `challenger_m5_2` (Archetype: EMPIRICAL CHALLENGER / Roles: critic, specialist)  
**Milestone**: M5 — Adversarial Integration, Concurrency, and Live Backend Verification  
**Date**: 2026-09-21  
**Target Suite**: Botock Document Conversion Suite (`pdf-to-word`, `word-to-pdf`, `pdf-to-excel`)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Live Backend Health & Route Inspection
- Command: `curl -s -i http://localhost:8000/`
  - Output:
    ```http
    HTTP/1.1 200 OK
    server: uvicorn
    content-length: 53
    content-type: application/json

    {"status":"ok","message":"Botock Backend is running"}
    ```
- Command: `curl -s http://localhost:8000/openapi.json | jq '.paths | keys'`
  - Output:
    ```json
    [
      "/",
      "/api/convert/docx-to-pdf",
      "/api/convert/pdf-to-docx",
      "/api/convert/pdf-to-excel"
    ]
    ```
- Binary Environment Probe: `which libreoffice soffice`
  - Output:
    ```
    /bin/libreoffice
    /bin/soffice
    ```
  - Confirmed: LibreOffice is available on the local environment for `word-to-pdf` headless conversion.

### 1.2 Full E2E Test Suite Execution
- Command: `node -e "process.argv.push('--strict'); import('./frontend/scripts/test-conversion-e2e.mjs');"`
  - Results:
    - **Total Tests Defined**: 47
    - **Tests Passed**: 47
    - **Tests Pending**: 0
    - **Tests Failed**: 0
    - **Execution Time**: 171 ms
    - Tier 1 (Feature Coverage): 15 passed
    - Tier 2 (Boundary & Corner Cases): 17 passed
    - Tier 3 (Cross-Feature & Engine): 9 passed
    - Tier 4 (Real-World Scenarios): 6 passed
    - Status: All static and simulated contract assertions pass in strict mode.

### 1.3 Discovered Defect: Error Alert Invisibility when `file === null`
- **File 1**: `frontend/app/tools/pdf-to-word/Client.tsx`
  - Lines 58–69 (`onDrop` callback):
    ```tsx
    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        cleanupBlobUrl();
        setResult(null);
        setErrorMessage(null);
        setStatus("idle");
        setStatusText("");

        if (rejectedFiles && rejectedFiles.length > 0) {
          setErrorMessage("Please upload a valid PDF document (.pdf).");
          return;
        }
    ```
  - Line 204 & Line 229:
    ```tsx
    {!file ? (
      <div {...getRootProps()} ...>
        {/* Dropzone UI */}
      </div>
    ) : (
      <div>
        {/* Selected File Header */}
        ...
        {/* Dismissible Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 ...">
            ...
          </div>
        )}
    ```
  - **Direct Observation**: When an invalid file (or multiple files) is dropped, `rejectedFiles` is populated. Line 67 sets `errorMessage`, but `file` remains `null`. The JSX ternary `!file ? (Dropzone) : (...)` evaluates to the true branch (Dropzone). The `errorMessage` alert at line 257 is inside the `false` (`file !== null`) branch. Thus, the error alert is NEVER rendered. The user observes no UI response to dropping an invalid file.

- **File 2**: `frontend/app/tools/pdf-to-excel/Client.tsx`
  - Lines 68–73 (`onDrop` callback):
    ```tsx
    const onDrop = useCallback(
      (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections && fileRejections.length > 0) {
          setErrorMessage("Please upload a valid PDF document (.pdf).");
          return;
        }
    ```
  - Line 197 & Line 220:
    ```tsx
    {!file ? (
      <div {...getRootProps()} ...>
        {/* Dropzone UI */}
      </div>
    ) : (
      <div>
        {/* Selected File Card */}
        ...
        {/* Dismissible Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 ...">
            ...
          </div>
        )}
    ```
  - **Direct Observation**: Identical masking defect. When invalid files are dropped, `file` remains `null`, and the error alert nested inside the `else` branch is completely unrendered.

- **File 3 (Correct Reference Implementation)**: `frontend/app/tools/word-to-pdf/Client.tsx`
  - Lines 223–253:
    ```tsx
    {/* Error Alert (Dismissible with Retry) */}
    {errorMessage && (
      <div role="alert" ...>
        ...
      </div>
    )}

    {/* Upload Zone (No file selected) */}
    {!file && (
      <div {...getRootProps()} ...>
    ```
  - In `word-to-pdf`, `errorMessage` is rendered at the top level outside both `!file` and `file` sections, so drop rejection errors ARE visible to the user.

### 1.4 Asynchronous Unmount Lifecycle & Phantom Trigger Observation
- In all three tools (`pdf-to-word/Client.tsx:118`, `word-to-pdf/Client.tsx:143`, `pdf-to-excel/Client.tsx:113`):
  - `fetch` calls lack `AbortController` signals.
  - If a user triggers conversion and navigates away before completion, the unmount cleanup runs while `activeUrlRef.current` is null.
  - When `fetch` resolves post-unmount, `URL.createObjectURL(blob)` is invoked and the browser download link `.click()` triggers. This newly allocated Blob URL is never revoked, leaking memory until tab close.

---

## 2. Logic Chain

1. **Premise 1**: Dropzone user experience requires that invalid file drops (unsupported MIME, invalid extension, or multi-file drops) provide immediate visual feedback explaining why the action was rejected.
2. **Premise 2**: In `pdf-to-word` and `pdf-to-excel`, `onDrop` handles `rejectedFiles` by calling `setErrorMessage(...)` and returning early without setting `file`.
3. **Premise 3**: In React App Router JSX rendering, `{condition ? (A) : (B)}` exclusively evaluates and renders branch `(A)` when `condition` is truthy.
4. **Step 4 (Inference)**: When `file === null`, `!file` is truthy. React renders branch `(A)` (the dropzone). The error alert JSX `{errorMessage && <Alert />}` is located exclusively within branch `(B)`.
5. **Step 5 (Empirical Consequence)**: Branch `(B)` is never mounted or rendered into the DOM. Consequently, the user is given no visual feedback whatsoever when dropping invalid files in `pdf-to-word` and `pdf-to-excel`.
6. **Step 6 (Contract Inconsistency)**: In `word-to-pdf`, the author recognized this requirement and hoisted `{errorMessage && <Alert />}` to the top level, proving that the nested placement in `pdf-to-word` and `pdf-to-excel` is an unintended defect.

---

## 3. Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: MEDIUM
- **Integrity Assessment**: HIGH (Genuinely implemented; all live backend routes and E2E tiers pass).
- **Core Findings**:
  1. Visual Error Masking Bug in `pdf-to-word` and `pdf-to-excel` upon file drop rejection.
  2. Missing `AbortController` on long-running network fetch causing memory leaks and phantom downloads upon unmount.

### Challenges

#### [High] Challenge 1: Error Alert Masking on Drop Rejection
- **Assumption Challenged**: The UI informs the user when an invalid file or unsupported format is dropped into the dropzone.
- **Attack Scenario**: User drags a `.docx`, `.png`, or multi-file selection onto `pdf-to-word` or `pdf-to-excel`.
- **Blast Radius**: Drop is silently ignored. User assumes tool is broken or unresponsive.
- **Mitigation**: Move the `{errorMessage && <Alert />}` component block outside the `{!file ? ... : ...}` ternary in both `pdf-to-word/Client.tsx` and `pdf-to-excel/Client.tsx`, matching `word-to-pdf/Client.tsx`.

#### [Medium] Challenge 2: Asynchronous Unmount Memory Leak & Phantom Download
- **Assumption Challenged**: Blob object URLs are always revoked upon unmount.
- **Attack Scenario**: User drops a 50MB PDF document, clicks "Convert", and navigates to `/tools/image-resize` while conversion is processing on the backend.
- **Blast Radius**:
  1. The backend completes conversion; client allocates `URL.createObjectURL` after unmount.
  2. Because the unmount cleanup effect has already executed, the newly created Blob URL is never revoked.
  3. `tempLink.click()` fires, suddenly initiating a file download on an unrelated page.
- **Mitigation**: Introduce an `AbortController` ref:
  ```typescript
  const abortControllerRef = useRef<AbortController | null>(null);
  // In handleConvert:
  abortControllerRef.current = new AbortController();
  const response = await fetch(endpoint, { method: "POST", body: formData, signal: abortControllerRef.current.signal });
  // In unmount useEffect:
  return () => {
    abortControllerRef.current?.abort();
    cleanupBlobUrl();
  };
  ```

#### [Low] Challenge 3: Lack of In-Flight User Cancellation
- **Assumption Challenged**: Users can cancel an in-progress conversion if they selected the wrong document or server is slow.
- **Attack Scenario**: User uploads a large document and wants to cancel.
- **Blast Radius**: The Reset/Remove button is disabled (`disabled={status === "converting"}`). The user is forced to wait or reload the browser.
- **Mitigation**: Enable the reset button during `converting` with a label "Cancel Conversion" wired to `abortController.abort()`.

### Stress Test Results
| Test Dimension | Target | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| Live Backend Connectivity | `http://localhost:8000/` | HTTP 200 `{"status":"ok"}` | HTTP 200 `{"status":"ok","message":"Botock Backend is running"}` | **PASS** |
| OpenAPI Endpoint Registry | `http://localhost:8000/openapi.json` | 3 conversion routes registered | `docx-to-pdf`, `pdf-to-docx`, `pdf-to-excel` present | **PASS** |
| Local Conversion Dependencies | System PATH | `soffice`/`libreoffice` available | `/bin/libreoffice` and `/bin/soffice` found | **PASS** |
| Strict E2E Test Suite | 43+ tests | 100% pass, 0 pending | 47 passed, 0 pending, 0 failed | **PASS** |
| Concurrency Double-Submit | All 3 tools | Convert button hidden during `converting` | Convert button unmounted while `status === "converting"` | **PASS** |
| Concurrency Reset Guard | All 3 tools | Reset disabled while converting | `disabled={status === "converting"}` present | **PASS** |
| Memory Revocation on Reset | All 3 tools | `URL.revokeObjectURL` called | Called in `handleReset`, `onDrop`, `cleanupBlobUrl` | **PASS** |
| Drop Rejection Error Visibility | `word-to-pdf` | Alert displayed when `file === null` | Rendered above file conditional check | **PASS** |
| Drop Rejection Error Visibility | `pdf-to-word` | Alert displayed when `file === null` | Hidden inside `file ? (...)` branch | **FAIL** |
| Drop Rejection Error Visibility | `pdf-to-excel` | Alert displayed when `file === null` | Hidden inside `file ? (...)` branch | **FAIL** |
| Unmount In-Flight Abort | All 3 tools | Fetch cancelled, no post-unmount blob | No `AbortController` in `Client.tsx` | **FAIL** (Adversarial Edge Case) |

### Unchallenged Areas
- Direct binary byte output fidelity of LibreOffice document layout (requires optical diffing tool / headless browser rendering).
- Multi-gigabyte OOM threshold testing on the Python backend container.

---

## 4. Caveats
- No modifications were made to implementation code, adhering strictly to the constraint: `Review-only — do NOT modify implementation code`.
- Automated tests in `frontend/scripts/test-conversion-e2e.mjs` test the presence of error string checks in code, but did not assert DOM layout placement for the alert relative to the dropzone ternary. The empirical AST inspection caught this discrepancy.

---

## 5. Conclusion & Actionable Verdict

### Verdict: **REQUEST_CHANGES**

The backend integration, OpenAPI route configuration, production build integrity, and base E2E test runner are in working order. However, empirical adversarial review identified a visual error masking defect in `pdf-to-word` and `pdf-to-excel`.

### Required Fixes:
1. **`frontend/app/tools/pdf-to-word/Client.tsx`**:
   - Extract `{errorMessage && (<div ...>...</div>)}` (lines 256–279) out of the `!file ? ... : ...` ternary and place it directly above `{!file ? (` (matching `word-to-pdf/Client.tsx` line 223).
2. **`frontend/app/tools/pdf-to-excel/Client.tsx`**:
   - Extract `{errorMessage && (<div ...>...</div>)}` (lines 253–277) out of the `!file ? ... : ...` ternary and place it directly above `{!file ? (` (matching `word-to-pdf/Client.tsx` line 223).
3. **Recommended Enhancement (Asynchronous Cancellation)**:
   - Add `AbortController` to `handleConvert` and invoke `abort()` in `handleReset` and `useEffect` unmount cleanup.

---

## 6. Verification Method

To independently verify this finding:
1. Open `frontend/app/tools/pdf-to-word/Client.tsx` and observe line 204 (`{!file ? (Dropzone) : (`). Trace to line 256 where `{errorMessage && (` begins. Note that when an invalid file is dropped, `file` remains `null`, causing the error alert to be suppressed.
2. Repeat for `frontend/app/tools/pdf-to-excel/Client.tsx` at line 197 and line 253.
3. Compare with `frontend/app/tools/word-to-pdf/Client.tsx` at line 223, where `{errorMessage && (` is properly hoisted above `{!file && (` at line 256.
4. Run the full strict E2E suite:
   ```bash
   node -e "process.argv.push('--strict'); import('./frontend/scripts/test-conversion-e2e.mjs');"
   ```
