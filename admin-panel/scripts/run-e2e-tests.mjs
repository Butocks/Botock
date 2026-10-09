#!/usr/bin/env node

/**
 * ============================================================================
 * Botock Video & Advanced PDF Suite — Opaque-Box E2E Test Runner
 * ============================================================================
 * 
 * Tools Under Test (N = 6):
 *   1. video-trim      (WASM stream copy & re-encode trimming)
 *   2. video-speed     (WASM PTS / atempo speed alteration)
 *   3. video-to-mp3    (WASM audio extraction & transcoding)
 *   4. video-compress  (WASM CRF & resolution downsampling)
 *   5. pdf-ocr         (PDF.js canvas rendering + Tesseract.js OCR)
 *   6. pdf-compress    (pdf-lib stream traversal & Canvas JPEG downsampling)
 * 
 * Test Methodology (4 Tiers):
 *   - Tier 1: Feature Coverage (>=5 tests per feature = 30 tests)
 *   - Tier 2: Boundary & Corner Cases (>=5 tests per feature = 31 tests)
 *   - Tier 3: Cross-Feature Interactions (7 tests)
 *   - Tier 4: Real-World Scenarios (5 tests)
 *   Total: 73 test cases
 * 
 * Usage:
 *   node frontend/scripts/run-e2e-tests.mjs
 *   node frontend/scripts/run-e2e-tests.mjs --tier=1,2
 *   node frontend/scripts/run-e2e-tests.mjs --verbose
 *   node frontend/scripts/run-e2e-tests.mjs --help
 * ============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runTier1Tests } from "../__tests__/e2e/tier1-feature-coverage.test.mjs";
import { runTier2Tests } from "../__tests__/e2e/tier2-boundary-corner.test.mjs";
import { runTier3Tests } from "../__tests__/e2e/tier3-cross-feature.test.mjs";
import { runTier4Tests } from "../__tests__/e2e/tier4-real-world.test.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(FRONTEND_ROOT, "..");

// CLI Argument Parsing
const args = process.argv.slice(2);
const isHelp = args.includes("--help") || args.includes("-h");
const isVerbose = args.includes("--verbose") || args.includes("-v");
const tierArg = args.find((a) => a.startsWith("--tier="))?.split("=")[1] ||
                (args.indexOf("--tier") !== -1 ? args[args.indexOf("--tier") + 1] : null);
const selectedTiers = tierArg
  ? tierArg.split(",").map((t) => parseInt(t.trim(), 10))
  : [1, 2, 3, 4];

if (isHelp) {
  console.log(`
Botock Video & Advanced PDF Tools — E2E Test Suite Runner

Usage:
  node frontend/scripts/run-e2e-tests.mjs [options]

Options:
  --tier=1,2,3,4    Execute only tests in specific tiers (comma-separated)
  --verbose, -v     Show detailed output and parameter breakdown
  --help, -h        Show this help message
`);
  process.exit(0);
}

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const c = {
  pass: (text) => `${colors.green}${colors.bold}✓ PASS${colors.reset} ${text}`,
  fail: (text) => `${colors.red}${colors.bold}✗ FAIL${colors.reset} ${text}`,
  info: (text) => `${colors.cyan}${text}${colors.reset}`,
  bold: (text) => `${colors.bold}${text}${colors.reset}`,
  dim: (text) => `${colors.dim}${text}${colors.reset}`,
  tierHeader: (tier, title) =>
    `\n${colors.magenta}${colors.bold}================================================================================\n[TIER ${tier}] ${title}\n================================================================================${colors.reset}\n`,
};

// Suite State Tracking
let passedCount = 0;
let failedCount = 0;
const failures = [];
const tierBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0 };

function reportPass(tier, name, details = "") {
  passedCount++;
  if (tierBreakdown[tier] !== undefined) tierBreakdown[tier]++;
  console.log(`  ${c.pass(`[T${tier}] ${name}`)}${details ? colors.dim + ` (${details})` + colors.reset : ""}`);
}

function reportFail(tier, name, reason) {
  failedCount++;
  failures.push({ tier, name, reason });
  console.log(`  ${c.fail(`[T${tier}] ${name}`)}`);
  console.log(`    ${colors.red}Error: ${reason}${colors.reset}`);
}

console.log(`${colors.cyan}${colors.bold}
╔════════════════════════════════════════════════════════════════════════════════╗
║         BOTOCK VIDEO & PDF SUITE — 4-TIER OPAQUE-BOX E2E TEST RUNNER           ║
║       Client-Side WASM & Canvas Verification, Privacy, and Schema Contracts     ║
╚════════════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
console.log(`  Frontend Root: ${colors.dim}${FRONTEND_ROOT}${colors.reset}`);
console.log(`  Selected Tiers: ${colors.bold}${selectedTiers.join(", ")}${colors.reset}\n`);

const startTime = Date.now();

// Execute Selected Tiers
async function runAll() {
  if (selectedTiers.includes(1)) {
    console.log(c.tierHeader(1, "FEATURE COVERAGE (Core Functionality & Contract Verification)"));
    await runTier1Tests({ reportPass, reportFail });
  }

  if (selectedTiers.includes(2)) {
    console.log(c.tierHeader(2, "BOUNDARY & CORNER CASES (Clamping, Zero/Corrupt Data, Extremes)"));
    await runTier2Tests({ reportPass, reportFail });
  }

  if (selectedTiers.includes(3)) {
    console.log(c.tierHeader(3, "CROSS-FEATURE INTERACTIONS (Pipelines, MEMFS Cleanup, Shared Engine)"));
    await runTier3Tests({ reportPass, reportFail });
  }

  if (selectedTiers.includes(4)) {
    console.log(c.tierHeader(4, "REAL-WORLD SCENARIOS (Presentation, Podcast, Invoice, Report, Social)"));
    await runTier4Tests({ reportPass, reportFail });
  }

  // Final Summary Report
  const durationMs = Date.now() - startTime;
  console.log(`\n${colors.cyan}${colors.bold}================================================================================\nTEST EXECUTION SUMMARY\n================================================================================${colors.reset}`);
  console.log(`  Total Tests Run:  ${colors.bold}${passedCount + failedCount}${colors.reset}`);
  console.log(`  Passed Tests:    ${colors.green}${colors.bold}${passedCount}${colors.reset}`);
  console.log(`  Failed Tests:    ${failedCount > 0 ? colors.red + colors.bold + failedCount : colors.dim + "0"}${colors.reset}`);
  console.log(`  Execution Time:  ${colors.bold}${durationMs}ms${colors.reset}`);
  console.log(`  Tier Breakdown:`);
  console.log(`    - Tier 1 (Feature Coverage):       ${colors.green}${tierBreakdown[1]}${colors.reset} passed`);
  console.log(`    - Tier 2 (Boundary & Corner Cases): ${colors.green}${tierBreakdown[2]}${colors.reset} passed`);
  console.log(`    - Tier 3 (Cross-Feature):          ${colors.green}${tierBreakdown[3]}${colors.reset} passed`);
  console.log(`    - Tier 4 (Real-World Scenarios):   ${colors.green}${tierBreakdown[4]}${colors.reset} passed`);
  console.log(`${colors.cyan}================================================================================${colors.reset}\n`);

  if (failedCount > 0) {
    console.error(`${colors.red}${colors.bold}FAILURE DETAILS:${colors.reset}`);
    for (const f of failures) {
      console.error(`  [Tier ${f.tier}] ${f.name}: ${f.reason}`);
    }
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✔ ALL E2E TESTS PASSED SUCCESSFULLY (Exit Code: 0)${colors.reset}\n`);
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error(`${colors.red}Fatal Runner Exception:${colors.reset}`, err);
  process.exit(1);
});
