# Empirical Adversarial Challenge Report: Document Conversion Suite

**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### Observation 1.1: Production Build Failure (`npm run build` exits code 1)
Running `npm run build` in `frontend` fails with exit code 1.
Verbatim Turbopack compiler error:
```text
Error: Turbopack build failed with 3 errors:
./app/tools/pdf-to-excel/page.tsx:5:16
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.
   3 | import { FileSpreadsheet, Server } from "lucide-react";
   4 |
>  5 | const Client = dynamic(() => import("./Client"), {
     |                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  6 |   ssr: false,
     | ^^^^^^^^^^^^^
>  7 |   loading: () => (
...
./app/tools/pdf-to-word/page.tsx:5:16
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.
   3 | import { FileText, Server } from "lucide-react";
   4 |
>  5 | const Client = dynamic(() => import("./Client"), {
     |                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  6 |   ssr: false,
...
./app/tools/word-to-pdf/page.tsx:5:16
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.
   3 | import { FileText, Server, ShieldCheck } from "lucide-react";
   4 |
>  5 | const Client = dynamic(() => import("./Client"), {
     |                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  6 |   ssr: false,
```

- Target Files:
  - `frontend/app/tools/pdf-to-excel/page.tsx:5-13`
  - `frontend/app/tools/pdf-to-word/page.tsx:5-15`
  - `frontend/app/tools/word-to-pdf/page.tsx:5-13`

### Observation 1.2: Dropzone File Rejection Alert Invisible to User when `file === null`
In `frontend/app/tools/pdf-to-word/Client.tsx` (lines 204-256) and `frontend/app/tools/pdf-to-excel/Client.tsx` (lines 197-254):
```tsx
// pdf-to-word/Client.tsx lines 204-257
204: {!file ? (
205:   <div {...getRootProps()} ...>
         ...
227:   </div>
228: ) : (
229:   <div>
230:     {/* Selected File Header */}
         ...
256:     {/* Dismissible Error Alert */}
257:     {errorMessage && (
258:       <div className="...">...</div>
259:     )}
```
When a user drops an invalid file (such as `.png`, `.docx`, `.txt`, or unsupported format) or a file with mismatched extension:
1. `onDrop` in `pdf-to-word/Client.tsx` executes:
   ```ts
   if (rejectedFiles && rejectedFiles.length > 0) {
     setErrorMessage("Please upload a valid PDF document (.pdf).");
     return;
   }
   ```
2. In `pdf-to-excel/Client.tsx`:
   ```ts
   if (fileRejections && fileRejections.length > 0) {
     setErrorMessage("Please upload a valid PDF document (.pdf).");
     return;
   }
   ```
3. In both components, `file` remains `null`.
4. In JSX, `{!file ? <UploadZone /> : <div>...{errorMessage && <Alert />}...</div>}` evaluates the first branch (`!file`).
5. The second branch containing `{errorMessage && <Alert />}` is NEVER rendered. The user sees zero visual feedback that their file was rejected.

In contrast, `frontend/app/tools/word-to-pdf/Client.tsx` (lines 222-255) correctly renders `{errorMessage && <Alert />}` at the top of the component container, BEFORE `{!file && <UploadZone />}`, which makes error alerts immediately visible even when `file === null`.

### Observation 1.3: Backend Error Handling Scenarios
- **HTTP 400 Bad Request with `{"detail": "No tables found in the PDF"}`**: Handled correctly by `pdf-to-excel/Client.tsx` line 140, mapping into clear guidance: *"No tables found in the PDF. Please upload a PDF that contains tables to convert to Excel."*.
- **HTTP 501 Not Implemented with `{"detail": "LibreOffice is not installed on the server"}`**: Handled correctly by `word-to-pdf/Client.tsx` line 175, mapping into: *"LibreOffice is not installed on the conversion server. Please ensure LibreOffice is installed and accessible in the server environment."*.
- **HTTP 422 Unprocessable Entity with array `[{"loc": ["body", "file"], "msg": "Field required"}]`**: All 3 tools correctly parse the array into `"Field required"` and avoid rendering `[object Object]`.
- **HTTP 500 with raw HTML or plain text**: All 3 tools wrap `res.json()` in try/catch and fall back to status text (e.g. `Server error (500: Internal Server Error)`), avoiding unhandled promise rejections.
- **Network failure (server offline / ECONNREFUSED)**: All 3 tools catch fetch rejection and update UI error state gracefully without crashing.

---

## 2. Logic Chain

1. **Build Gate Violation**:
   - `ORIGINAL_REQUEST.md` (R3, Acceptance Criteria) and `SCOPE.md` (Milestone 5, Feature #9) explicitly dictate that `npm run build` must exit code 0 without any compilation errors.
   - Next.js 16 (App Router with Turbopack) enforces that Server Components cannot invoke `dynamic(..., { ssr: false })`.
   - `page.tsx` in `pdf-to-word`, `word-to-pdf`, and `pdf-to-excel` are Server Components (they export `metadata: Metadata`). All 3 invoke `dynamic(() => import("./Client"), { ssr: false, ... })`.
   - Therefore, `npm run build` fails immediately during Turbopack compilation.

2. **UX / Tool Architecture Failure Mode**:
   - According to `tool_architecture.md` §2 ("Tool Isolation & Crash Resilience"), tools must provide resilient boundaries and clear user communication.
   - When users drag-and-drop a disallowed file format (e.g. an image, text file, or docx into `pdf-to-word`), `react-dropzone` rejects the file.
   - The handler sets `errorMessage`, but because `errorMessage` is trapped inside the `file ?` branch, the alert is suppressed.
   - The user experiences a silent failure: the file drop does nothing, the dropzone remains empty, and no error or warning message appears.

---

## 3. Caveats

- The backend API (`http://localhost:8000`) is operational and conforms to the specified endpoint contracts.
- Once the `ssr: false` in `page.tsx` and the JSX alert placement in `Client.tsx` are addressed, the tools' core conversion logic and error parsing routines are resilient.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

Required fixes before approval:

1. **Fix `ssr: false` in Server Components (`page.tsx`)**:
   In `frontend/app/tools/pdf-to-word/page.tsx`, `frontend/app/tools/word-to-pdf/page.tsx`, and `frontend/app/tools/pdf-to-excel/page.tsx`:
   Remove `ssr: false` from the `dynamic()` options (or import `Client` directly as a standard Client Component import):
   ```tsx
   const Client = dynamic(() => import("./Client"), {
     loading: () => (
       ...
     ),
   });
   ```

2. **Fix Error Alert Placement in `pdf-to-word/Client.tsx` and `pdf-to-excel/Client.tsx`**:
   Move `{errorMessage && (<div className="mb-6 p-4 rounded-2xl bg-rose-500/10...">...</div>)}` outside and above the `{!file ? <UploadZone /> : ...}` conditional block (adopting the working pattern used in `word-to-pdf/Client.tsx`). Guard the retry button inside the alert with `{file && status === "error" && ...}`.

---

## 5. Verification Method

To independently reproduce and verify:

1. **Build Verification**:
   ```bash
   cd /home/mir/Documents/botock/frontend
   npm run build
   ```
   *Expected result prior to fix*: Exits with code 1 and logs 3 errors citing `` `ssr: false` is not allowed with `next/dynamic` in Server Components ``.
   *Expected result after fix*: Exits with code 0 (Build succeeds).

2. **Dropzone Rejection Alert Verification**:
   - In `frontend/app/tools/pdf-to-word/Client.tsx`:
     Inspect lines 204 and 256. Notice `{errorMessage && ...}` is inside the `else` branch of `{!file ? ... : ...}`. When `file` is `null`, `errorMessage` cannot render.
   - Drop a non-PDF file into `/tools/pdf-to-word`: Observe whether an error alert appears.

3. **E2E Suite**:
   ```bash
   node /home/mir/Documents/botock/frontend/scripts/test-conversion-e2e.mjs
   ```
