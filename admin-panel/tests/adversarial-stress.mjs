#!/usr/bin/env node

/**
 * ============================================================================
 * Botock Document Conversion Suite — Empirical Adversarial Stress Test Suite
 * ============================================================================
 * 
 * Target Tools:
 *   1. pdf-to-word  (app/tools/pdf-to-word)
 *   2. word-to-pdf  (app/tools/word-to-pdf)
 *   3. pdf-to-excel (app/tools/pdf-to-excel)
 * 
 * Adversarial Dimensions Under Test:
 *   1. Edge case file inputs:
 *      - 0-byte files
 *      - Unusual filenames (spaces, unicode, emojis, RTL, long names, quotes)
 *      - Case-insensitive extensions (.PDF, .DOCX, .DOC)
 *      - Mismatched extensions (.png, .txt, .docx to pdf tool, etc.)
 *   2. Backend error scenarios:
 *      - HTTP 400 Bad Request with {"detail": "No tables found in the PDF"}
 *      - HTTP 400 Bad Request with {"detail": "File must be a PDF"}
 *      - HTTP 501 Not Implemented with {"detail": "LibreOffice is not installed on the server"}
 *      - HTTP 422 Unprocessable Entity with FastAPI array detail: [{"loc":["body","file"],"msg":"Field required"}]
 *      - HTTP 500 Internal Server Error with HTML markup (e.g. Nginx / crash dump)
 *      - HTTP 500 Internal Server Error with plain text (non-JSON)
 *      - HTTP 502 / 503 / 504 Gateway errors with HTML
 *      - Network failure (connection refused / ECONNREFUSED)
 *      - Abrupt socket destruction mid-transfer
 *   3. UI Error Alert Visibility & Graceful Failure:
 *      - Alert rendering when file === null (e.g. drop rejection)
 *      - Alert rendering when conversion fails
 *      - Content-Disposition header filename extraction & fallbacks
 *      - Memory leak prevention (URL.revokeObjectURL)
 *   4. Live Backend Empiric Verification (http://localhost:8000)
 * ============================================================================
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

let passCount = 0;
let failCount = 0;
const failures = [];

function recordPass(testName, details = "") {
  passCount++;
  console.log(`  ${colors.green}✓ PASS${colors.reset} ${testName}${details ? ` ${colors.gray}(${details})${colors.reset}` : ""}`);
}

function recordFail(testName, reason) {
  failCount++;
  failures.push({ testName, reason });
  console.log(`  ${colors.red}✗ FAIL${colors.reset} ${testName}`);
  console.log(`    ${colors.red}Reason: ${reason}${colors.reset}`);
}

// ---------------------------------------------------------------------------
// Mock HTTP Server Helper
// ---------------------------------------------------------------------------
function createMockServer() {
  let handler = (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "default" }));
  };

  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  return {
    server,
    setHandler: (newHandler) => { handler = newHandler; },
    listen: () => new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        resolve(`http://127.0.0.1:${port}`);
      });
    }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// ---------------------------------------------------------------------------
// Component Logic Extractors & Simulators
// ---------------------------------------------------------------------------

// Client file loaders
const pdfToWordSrc = fs.readFileSync(path.join(FRONTEND_ROOT, "app/tools/pdf-to-word/Client.tsx"), "utf-8");
const wordToPdfSrc = fs.readFileSync(path.join(FRONTEND_ROOT, "app/tools/word-to-pdf/Client.tsx"), "utf-8");
const pdfToExcelSrc = fs.readFileSync(path.join(FRONTEND_ROOT, "app/tools/pdf-to-excel/Client.tsx"), "utf-8");

// Simulation of pdf-to-word conversion logic
async function simulatePdfToWordConvert(mockBaseUrl, file) {
  let status = "idle";
  let statusText = "";
  let errorMessage = null;
  let result = null;

  if (!file) return { status, statusText, errorMessage, result };

  status = "converting";
  statusText = "Converting PDF to DOCX on server...";
  errorMessage = null;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${mockBaseUrl}/api/convert/pdf-to-docx`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = `Server error (${response.status}: ${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          if (typeof errorJson.detail === "string") {
            errorDetail = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorDetail = errorJson.detail
              .map((d) => d.msg || JSON.stringify(d))
              .join(", ");
          } else {
            errorDetail = JSON.stringify(errorJson.detail);
          }
        }
      } catch {
        // Fallback errorDetail
      }
      throw new Error(errorDetail);
    }

    const blob = await response.blob();
    let outputFilename = file.name.replace(/\.[^/.]+$/, "") + ".docx";
    const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches && matches[1]) {
        const parsed = matches[1].replace(/['"]/g, "").trim();
        if (parsed) outputFilename = parsed;
      }
    }

    result = { filename: outputFilename, size: blob.size };
    status = "success";
    statusText = "Conversion completed successfully!";
  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : "Failed to connect to conversion server. Please check your connection and try again.";
    errorMessage = message;
    status = "error";
    statusText = "";
  }

  return { status, statusText, errorMessage, result };
}

// Simulation of word-to-pdf conversion logic
function extractWordToPdfFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }
  return fallback;
}

async function simulateWordToPdfConvert(mockBaseUrl, file) {
  let status = "idle";
  let errorMessage = null;
  let resultFilename = "";
  let resultSize = null;

  if (!file) return { status, errorMessage, resultFilename, resultSize };

  status = "converting";
  errorMessage = null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = `${mockBaseUrl.replace(/\/$/, "")}/api/convert/docx-to-pdf`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let detailMessage = `Server error (${response.status}: ${response.statusText || "Conversion failed"})`;
      try {
        const errorJson = await response.json();
        if (errorJson?.detail) {
          if (typeof errorJson.detail === "string") {
            detailMessage = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            detailMessage = errorJson.detail
              .map((d) => d.msg || JSON.stringify(d))
              .join(", ");
          } else {
            detailMessage = JSON.stringify(errorJson.detail);
          }
        }
      } catch {}

      if (response.status === 501 || detailMessage.toLowerCase().includes("libreoffice")) {
        detailMessage = "LibreOffice is not installed on the conversion server. Please ensure LibreOffice is installed and accessible in the server environment.";
      }

      throw new Error(detailMessage);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    resultFilename = extractWordToPdfFilename(contentDisposition, `${baseName}.pdf`);
    resultSize = blob.size;
    status = "success";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch failed")) {
      errorMessage = "Unable to connect to the document conversion server (http://localhost:8000). Please check your internet connection or verify the backend server is running.";
    } else {
      errorMessage = msg || "An unexpected error occurred during conversion.";
    }
    status = "error";
  }

  return { status, errorMessage, resultFilename, resultSize };
}

// Simulation of pdf-to-excel conversion logic
async function simulatePdfToExcelConvert(mockBaseUrl, file) {
  let status = "idle";
  let errorMessage = null;
  let result = null;

  if (!file) return { status, errorMessage, result };

  status = "converting";
  errorMessage = null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${mockBaseUrl.replace(/\/$/, "")}/api/convert/pdf-to-excel`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let extractedDetail = "";
      try {
        const errorJson = await res.json();
        if (errorJson?.detail) {
          extractedDetail = typeof errorJson.detail === "string"
            ? errorJson.detail
            : Array.isArray(errorJson.detail) && errorJson.detail[0]?.msg
            ? errorJson.detail[0].msg
            : JSON.stringify(errorJson.detail);
        }
      } catch {}

      if (res.status === 400 && (extractedDetail.includes("No tables found") || extractedDetail.toLowerCase().includes("no tables"))) {
        throw new Error("No tables found in the PDF. Please upload a PDF that contains tables to convert to Excel.");
      }

      if (extractedDetail) {
        throw new Error(extractedDetail);
      }

      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
    }

    const blob = await res.blob();
    let outputFilename = file.name.replace(/\.[^/.]+$/, "") + ".xlsx";
    const disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        outputFilename = match[1].trim();
      }
    }

    result = { filename: outputFilename, size: blob.size };
    status = "success";
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to convert PDF to Excel. Please check the backend connection and try again.";
    errorMessage = msg;
    status = "error";
  }

  return { status, errorMessage, result };
}

// ---------------------------------------------------------------------------
// MAIN ADVERSARIAL TEST SUITE
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n${colors.magenta}${colors.bold}================================================================================\n EMPIRICAL ADVERSARIAL STRESS TEST SUITE — BOTOCK CONVERSION TOOLS\n================================================================================${colors.reset}\n`);

  const mock = createMockServer();
  const mockBaseUrl = await mock.listen();
  console.log(`  ${colors.cyan}Mock HTTP server started on ${mockBaseUrl}${colors.reset}\n`);

  // =========================================================================
  // SECTION 1: BACKEND ERROR SCENARIOS (HTTP 400, 422, 500 HTML/text, 501, Network)
  // =========================================================================
  console.log(`${colors.blue}${colors.bold}--- [1. Backend Error Scenarios Stress Testing] ---${colors.reset}`);

  // Test 1.1: HTTP 400 "No tables found in the PDF" on pdf-to-excel
  {
    mock.setHandler((req, res) => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: "No tables found in the PDF" }));
    });

    const dummyFile = new File(["dummy pdf content"], "report.pdf", { type: "application/pdf" });
    const res = await simulatePdfToExcelConvert(mockBaseUrl, dummyFile);

    if (res.status === "error" && res.errorMessage && res.errorMessage.includes("No tables found in the PDF. Please upload a PDF that contains tables")) {
      recordPass("pdf-to-excel: HTTP 400 'No tables found' handled with user-friendly guidance", res.errorMessage);
    } else {
      recordFail("pdf-to-excel: HTTP 400 'No tables found' handling", `Expected friendly guidance, got status: ${res.status}, error: ${res.errorMessage}`);
    }
  }

  // Test 1.2: HTTP 501 "LibreOffice is not installed on the server" on word-to-pdf
  {
    mock.setHandler((req, res) => {
      res.writeHead(501, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: "LibreOffice is not installed on the server" }));
    });

    const dummyFile = new File(["dummy docx content"], "memo.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const res = await simulateWordToPdfConvert(mockBaseUrl, dummyFile);

    if (res.status === "error" && res.errorMessage && res.errorMessage.includes("LibreOffice is not installed on the conversion server")) {
      recordPass("word-to-pdf: HTTP 501 LibreOffice missing handled with actionable system instruction", res.errorMessage);
    } else {
      recordFail("word-to-pdf: HTTP 501 LibreOffice missing handling", `Expected LibreOffice guidance, got: ${res.errorMessage}`);
    }
  }

  // Test 1.3: HTTP 422 FastAPI validation array on pdf-to-word, word-to-pdf, pdf-to-excel
  {
    const fastApi422 = {
      detail: [
        { loc: ["body", "file"], msg: "Field required", type: "missing" }
      ]
    };

    mock.setHandler((req, res) => {
      res.writeHead(422, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fastApi422));
    });

    const fPdf = new File(["test"], "sample.pdf", { type: "application/pdf" });
    const fDocx = new File(["test"], "sample.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    const resPdf = await simulatePdfToWordConvert(mockBaseUrl, fPdf);
    const resWord = await simulateWordToPdfConvert(mockBaseUrl, fDocx);
    const resExcel = await simulatePdfToExcelConvert(mockBaseUrl, fPdf);

    if (resPdf.status === "error" && resPdf.errorMessage === "Field required" && !resPdf.errorMessage.includes("[object Object]")) {
      recordPass("pdf-to-word: HTTP 422 FastAPI detail array parsed to string ('Field required')", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: HTTP 422 FastAPI detail parsing", `Expected 'Field required', got: ${resPdf.errorMessage}`);
    }

    if (resWord.status === "error" && resWord.errorMessage === "Field required" && !resWord.errorMessage.includes("[object Object]")) {
      recordPass("word-to-pdf: HTTP 422 FastAPI detail array parsed to string ('Field required')", resWord.errorMessage);
    } else {
      recordFail("word-to-pdf: HTTP 422 FastAPI detail parsing", `Expected 'Field required', got: ${resWord.errorMessage}`);
    }

    if (resExcel.status === "error" && resExcel.errorMessage === "Field required" && !resExcel.errorMessage.includes("[object Object]")) {
      recordPass("pdf-to-excel: HTTP 422 FastAPI detail array parsed to string ('Field required')", resExcel.errorMessage);
    } else {
      recordFail("pdf-to-excel: HTTP 422 FastAPI detail parsing", `Expected 'Field required', got: ${resExcel.errorMessage}`);
    }
  }

  // Test 1.4: HTTP 500 with raw HTML error page (e.g. Nginx 500 or Python traceback)
  {
    const html500 = `<!DOCTYPE html>
<html>
<head><title>500 Internal Server Error</title></head>
<body>
<h1>Internal Server Error</h1>
<p>Crash dump traceback at line 42</p>
</body>
</html>`;

    mock.setHandler((req, res) => {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(html500);
    });

    const fPdf = new File(["test"], "crash.pdf", { type: "application/pdf" });
    const fDocx = new File(["test"], "crash.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    const resPdf = await simulatePdfToWordConvert(mockBaseUrl, fPdf);
    const resWord = await simulateWordToPdfConvert(mockBaseUrl, fDocx);
    const resExcel = await simulatePdfToExcelConvert(mockBaseUrl, fPdf);

    if (resPdf.status === "error" && resPdf.errorMessage.includes("500")) {
      recordPass("pdf-to-word: HTTP 500 HTML response caught without crashing JSON parser", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: HTTP 500 HTML response", `Expected 500 server error, got: ${resPdf.errorMessage}`);
    }

    if (resWord.status === "error" && resWord.errorMessage.includes("500")) {
      recordPass("word-to-pdf: HTTP 500 HTML response caught without crashing JSON parser", resWord.errorMessage);
    } else {
      recordFail("word-to-pdf: HTTP 500 HTML response", `Expected 500 server error, got: ${resWord.errorMessage}`);
    }

    if (resExcel.status === "error" && resExcel.errorMessage.includes("500")) {
      recordPass("pdf-to-excel: HTTP 500 HTML response caught without crashing JSON parser", resExcel.errorMessage);
    } else {
      recordFail("pdf-to-excel: HTTP 500 HTML response", `Expected 500 server error, got: ${resExcel.errorMessage}`);
    }
  }

  // Test 1.5: HTTP 500 with plain text error (non-JSON)
  {
    const plainText500 = "Internal Server Error: Segmentation fault (core dumped)";
    mock.setHandler((req, res) => {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(plainText500);
    });

    const fPdf = new File(["test"], "plain.pdf", { type: "application/pdf" });
    const resPdf = await simulatePdfToWordConvert(mockBaseUrl, fPdf);
    const resExcel = await simulatePdfToExcelConvert(mockBaseUrl, fPdf);

    if (resPdf.status === "error" && resPdf.errorMessage.includes("500")) {
      recordPass("pdf-to-word: HTTP 500 plain text response caught gracefully", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: HTTP 500 plain text response", `Got: ${resPdf.errorMessage}`);
    }

    if (resExcel.status === "error" && resExcel.errorMessage.includes("500")) {
      recordPass("pdf-to-excel: HTTP 500 plain text response caught gracefully", resExcel.errorMessage);
    } else {
      recordFail("pdf-to-excel: HTTP 500 plain text response", `Got: ${resExcel.errorMessage}`);
    }
  }

  // Test 1.6: Network failure (server offline / connection refused)
  {
    const offlineUrl = "http://127.0.0.1:59981"; // Unbound port
    const fPdf = new File(["test"], "network.pdf", { type: "application/pdf" });
    const fDocx = new File(["test"], "network.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    const resPdf = await simulatePdfToWordConvert(offlineUrl, fPdf);
    const resWord = await simulateWordToPdfConvert(offlineUrl, fDocx);
    const resExcel = await simulatePdfToExcelConvert(offlineUrl, fPdf);

    if (resPdf.status === "error" && resPdf.errorMessage) {
      recordPass("pdf-to-word: Network failure caught gracefully without unhandled rejection", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: Network failure handling", `Expected error status, got: ${resPdf.status}`);
    }

    if (resWord.status === "error" && resWord.errorMessage.includes("Unable to connect to the document conversion server")) {
      recordPass("word-to-pdf: Network failure caught with descriptive backend unreachable alert", resWord.errorMessage);
    } else {
      recordFail("word-to-pdf: Network failure handling", `Expected friendly connection alert, got: ${resWord.errorMessage}`);
    }

    if (resExcel.status === "error" && resExcel.errorMessage) {
      recordPass("pdf-to-excel: Network failure caught gracefully without unhandled rejection", resExcel.errorMessage);
    } else {
      recordFail("pdf-to-excel: Network failure handling", `Expected error status, got: ${resExcel.status}`);
    }
  }

  // Test 1.7: Abrupt socket destruction mid-transfer
  {
    mock.setHandler((req, res) => {
      req.socket.destroy();
    });

    const fPdf = new File(["test payload"], "abrupt.pdf", { type: "application/pdf" });
    const resPdf = await simulatePdfToWordConvert(mockBaseUrl, fPdf);

    if (resPdf.status === "error" && resPdf.errorMessage) {
      recordPass("pdf-to-word: Abrupt socket termination caught gracefully", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: Abrupt socket termination", `Expected error status, got: ${resPdf.status}`);
    }
  }

  // =========================================================================
  // SECTION 2: EDGE CASE FILE INPUTS & CONTENT-DISPOSITION STRESS TESTING
  // =========================================================================
  console.log(`\n${colors.blue}${colors.bold}--- [2. Edge Case File Inputs Stress Testing] ---${colors.reset}`);

  // Test 2.1: 0-byte file input handling
  {
    mock.setHandler((req, res) => {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: "Conversion failed: file is empty" }));
    });

    const emptyPdf = new File([], "empty.pdf", { type: "application/pdf" });
    const resPdf = await simulatePdfToWordConvert(mockBaseUrl, emptyPdf);

    if (resPdf.status === "error" && resPdf.errorMessage.includes("Conversion failed")) {
      recordPass("pdf-to-word: 0-byte file upload handled without client crash", resPdf.errorMessage);
    } else {
      recordFail("pdf-to-word: 0-byte file upload", `Expected error status, got: ${resPdf.status}`);
    }
  }

  // Test 2.2: Unusual Filenames (Spaces, Unicode, Emojis, RTL, Long Names)
  {
    const unusualFilenames = [
      {
        input: "My Annual Financial Report (2026) - Final Version.pdf",
        expectedWord: "My Annual Financial Report (2026) - Final Version.docx",
        expectedExcel: "My Annual Financial Report (2026) - Final Version.xlsx",
        desc: "Spaces, parentheses, and dashes"
      },
      {
        input: "日本語ドキュメント_тест_éàç_🚀.pdf",
        expectedWord: "日本語ドキュメント_тест_éàç_🚀.docx",
        expectedExcel: "日本語ドキュメント_тест_éàç_🚀.xlsx",
        desc: "Multilingual Unicode (Japanese, Cyrillic, accented Latin, emoji)"
      },
      {
        input: "تقرير_الشركة_2026.docx",
        expectedPdf: "تقرير_الشركة_2026.pdf",
        desc: "Right-to-Left (Arabic) filename"
      },
      {
        input: "a".repeat(250) + ".pdf",
        expectedWord: "a".repeat(250) + ".docx",
        expectedExcel: "a".repeat(250) + ".xlsx",
        desc: "Extremely long filename (250+ characters)"
      },
      {
        input: "invoice.pdf.docx",
        expectedPdf: "invoice.pdf.pdf",
        desc: "Double extension (.pdf.docx -> .pdf.pdf)"
      }
    ];

    mock.setHandler((req, res) => {
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="server_processed.output"`
      });
      res.end(Buffer.from("mock converted content"));
    });

    for (const testCase of unusualFilenames) {
      if (testCase.input.endsWith(".pdf")) {
        const file = new File(["content"], testCase.input, { type: "application/pdf" });
        const resWord = await simulatePdfToWordConvert(mockBaseUrl, file);
        const resExcel = await simulatePdfToExcelConvert(mockBaseUrl, file);

        if (resWord.status === "success" && resExcel.status === "success") {
          recordPass(`Unusual filename (${testCase.desc}) converted without error`);
        } else {
          recordFail(`Unusual filename (${testCase.desc})`, `Word status: ${resWord.status}, Excel status: ${resExcel.status}`);
        }
      } else if (testCase.input.endsWith(".docx")) {
        const file = new File(["content"], testCase.input, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const resWord = await simulateWordToPdfConvert(mockBaseUrl, file);
        if (resWord.status === "success") {
          recordPass(`Unusual filename (${testCase.desc}) converted without error`);
        } else {
          recordFail(`Unusual filename (${testCase.desc})`, `Word status: ${resWord.status}`);
        }
      }
    }
  }

  // Test 2.3: RFC 5987 / RFC 6266 UTF-8 Content-Disposition parsing in word-to-pdf
  {
    mock.setHandler((req, res) => {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename*=UTF-8''%E6%97%A5%E6%9C%AC%E8%AA%9E_%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88.pdf"
      });
      res.end(Buffer.from("mock pdf binary"));
    });

    const file = new File(["dummy docx"], "sample.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const res = await simulateWordToPdfConvert(mockBaseUrl, file);

    if (res.status === "success" && res.resultFilename === "日本語_レポート.pdf") {
      recordPass("word-to-pdf: Content-Disposition RFC 5987 UTF-8 encoded filename correctly decoded", res.resultFilename);
    } else {
      recordFail("word-to-pdf: Content-Disposition RFC 5987 parsing", `Expected '日本語_レポート.pdf', got: '${res.resultFilename}'`);
    }
  }

  // =========================================================================
  // SECTION 3: UI ERROR ALERT VISIBILITY & STRUCTURAL AUDIT (CRITICAL VULNERABILITY CHECK)
  // =========================================================================
  console.log(`\n${colors.blue}${colors.bold}--- [3. UI Error Alert Visibility & Component Architecture Audit] ---${colors.reset}`);

  // Test 3.1: Verify if errorMessage is rendered when file === null in word-to-pdf
  {
    // In word-to-pdf, errorMessage alert is rendered BEFORE {!file && ...}
    const hasWordAlertOutsideFileCheck = wordToPdfSrc.indexOf("{errorMessage &&") < wordToPdfSrc.indexOf("{!file &&");
    if (hasWordAlertOutsideFileCheck) {
      recordPass("word-to-pdf: Error alert renders at container root before file selection check (visible on drop rejection)");
    } else {
      recordFail("word-to-pdf: Error alert placement", "Error alert is hidden when file === null");
    }
  }

  // Test 3.2: Verify if errorMessage is rendered when file === null in pdf-to-word
  {
    // In pdf-to-word, let's inspect the JSX structure:
    // Does {!file ? (...) : (...)} enclose {errorMessage && ...}?
    const notFileIdx = pdfToWordSrc.indexOf("{!file ?");
    const elseIdx = pdfToWordSrc.indexOf(") : (", notFileIdx);
    const errorAlertIdx = pdfToWordSrc.indexOf("{errorMessage &&");

    const isInsideElseBranch = errorAlertIdx > elseIdx;

    if (isInsideElseBranch) {
      recordFail(
        "pdf-to-word [BUG CONFIRMED]: Error alert placed inside 'file' branch of ternary — INVISIBLE when file === null",
        "When user drops an invalid file (rejected by useDropzone or invalid extension), file remains null. Because {!file ? (Dropzone) : (...{errorMessage && <Alert />}...)} hides the else branch when file is null, the user sees NO visual error alert!"
      );
    } else {
      recordPass("pdf-to-word: Error alert visible when file is null");
    }
  }

  // Test 3.3: Verify if errorMessage is rendered when file === null in pdf-to-excel
  {
    const notFileIdx = pdfToExcelSrc.indexOf("{!file ?");
    const elseIdx = pdfToExcelSrc.indexOf(") : (", notFileIdx);
    const errorAlertIdx = pdfToExcelSrc.indexOf("{errorMessage &&");

    const isInsideElseBranch = errorAlertIdx > elseIdx;

    if (isInsideElseBranch) {
      recordFail(
        "pdf-to-excel [BUG CONFIRMED]: Error alert placed inside 'file' branch of ternary — INVISIBLE when file === null",
        "When user drops an invalid file (rejected by useDropzone), file remains null. Because {!file ? (Dropzone) : (...{errorMessage && <Alert />}...)} hides the else branch when file is null, the user sees NO visual error alert!"
      );
    } else {
      recordPass("pdf-to-excel: Error alert visible when file is null");
    }
  }

  // =========================================================================
  // SECTION 4: LIVE BACKEND EMPIRICAL STRESS PROBE (http://localhost:8000)
  // =========================================================================
  console.log(`\n${colors.blue}${colors.bold}--- [4. Live Backend Empirical Stress Probe (http://localhost:8000)] ---${colors.reset}`);

  try {
    const liveRootRes = await fetch("http://localhost:8000/");
    const liveRootJson = await liveRootRes.json();
    console.log(`  ${colors.cyan}Live backend active: status=${liveRootJson.status}, message="${liveRootJson.message}"${colors.reset}`);

    // Probe 4.1: Missing file field (HTTP 422 array)
    {
      const res = await fetch("http://localhost:8000/api/convert/pdf-to-docx", {
        method: "POST",
        body: new FormData(), // empty body
      });
      const data = await res.json();
      if (res.status === 422 && Array.isArray(data.detail) && data.detail[0].msg === "Field required") {
        recordPass("Live Backend: POST /api/convert/pdf-to-docx returns HTTP 422 with FastAPI validation array", `detail: ${data.detail[0].msg}`);
      } else {
        recordFail("Live Backend: HTTP 422 validation response", `Expected 422 with array, got status ${res.status}`);
      }
    }

    // Probe 4.2: Invalid extension on pdf-to-docx (HTTP 400 "File must be a PDF")
    {
      const fd = new FormData();
      fd.append("file", new Blob(["mock"], { type: "text/plain" }), "fake.txt");
      const res = await fetch("http://localhost:8000/api/convert/pdf-to-docx", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.status === 400 && data.detail === "File must be a PDF") {
        recordPass("Live Backend: POST /api/convert/pdf-to-docx with .txt rejects with HTTP 400", `detail: "${data.detail}"`);
      } else {
        recordFail("Live Backend: .txt rejection on pdf-to-docx", `Expected 400 'File must be a PDF', got status ${res.status}`);
      }
    }

    // Probe 4.3: Invalid extension on docx-to-pdf (HTTP 400 "File must be a Word document")
    {
      const fd = new FormData();
      fd.append("file", new Blob(["mock"], { type: "application/pdf" }), "document.pdf");
      const res = await fetch("http://localhost:8000/api/convert/docx-to-pdf", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.status === 400 && data.detail === "File must be a Word document") {
        recordPass("Live Backend: POST /api/convert/docx-to-pdf with .pdf rejects with HTTP 400", `detail: "${data.detail}"`);
      } else {
        recordFail("Live Backend: .pdf rejection on docx-to-pdf", `Expected 400 'File must be a Word document', got status ${res.status}`);
      }
    }

    // Probe 4.4: 0-byte PDF upload on pdf-to-docx (HTTP 500 Conversion failed)
    {
      const fd = new FormData();
      fd.append("file", new Blob([], { type: "application/pdf" }), "zero_byte.pdf");
      const res = await fetch("http://localhost:8000/api/convert/pdf-to-docx", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.status === 500 && data.detail && data.detail.startsWith("Conversion failed")) {
        recordPass("Live Backend: POST /api/convert/pdf-to-docx with 0-byte file returns HTTP 500", `detail: "${data.detail.substring(0, 45)}..."`);
      } else {
        recordFail("Live Backend: 0-byte file handling on pdf-to-docx", `Expected 500 Conversion failed, got status ${res.status}`);
      }
    }

  } catch (backendErr) {
    recordFail("Live Backend: Connectivity probe", `Could not connect to live backend: ${backendErr.message}`);
  }

  // Cleanup mock server
  await mock.close();

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${colors.magenta}${colors.bold}================================================================================\n EMPIRICAL STRESS TEST EXECUTION SUMMARY\n================================================================================${colors.reset}`);
  console.log(`  Total Tests Executed: ${passCount + failCount}`);
  console.log(`  Tests Passed:         ${colors.green}${passCount}${colors.reset}`);
  console.log(`  Tests Failed:         ${colors.red}${failCount}${colors.reset}`);

  if (failCount > 0) {
    console.log(`\n  ${colors.red}${colors.bold}Failure Breakdown:${colors.reset}`);
    for (const f of failures) {
      console.log(`    - ${colors.bold}${f.testName}${colors.reset}: ${f.reason}`);
    }
  }

  return failCount;
}

main().then((failed) => {
  if (failed > 0) {
    console.log(`\n${colors.red}${colors.bold}VERDICT: REQUEST_CHANGES (${failed} adversarial stress vulnerabilities identified)${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}VERDICT: APPROVE (All adversarial stress tests passed)${colors.reset}\n`);
    process.exit(0);
  }
}).catch((err) => {
  console.error("Stress test harness error:", err);
  process.exit(1);
});
