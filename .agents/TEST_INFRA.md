# E2E Test Infra: Botock Client-Side Image Suite

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Verification of:
  1. Route & Server Component generation (HTTP 200, SEO metadata, JSON-LD schema)
  2. Client Component integrity (100% browser execution, zero backend API calls)
  3. Crash resilience (Error boundary isolation in error.tsx)
  4. ToolEngine programmatic registration & parameter schema validation
  5. Next.js production build (`npm run build`) exit code 0
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | `image-resize` | ORIGINAL_REQUEST R1.1 | 5 | 5 | ✓ |
| 2 | `image-compress` | ORIGINAL_REQUEST R1.2 | 5 | 5 | ✓ |
| 3 | `image-remove-bg` | ORIGINAL_REQUEST R1.3 | 5 | 5 | ✓ |
| 4 | `image-to-webp` | ORIGINAL_REQUEST R1.4 | 5 | 5 | ✓ |
| 5 | `image-upscale` | ORIGINAL_REQUEST R1.5 | 5 | 5 | ✓ |
| 6 | `ToolEngine.ts` Registration | ORIGINAL_REQUEST R2 & tool_architecture.md | 5 | 5 | ✓ |
| 7 | Architecture & Crash Isolation | ORIGINAL_REQUEST R2 (page, Client, error) | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Node.js / TypeScript test script (`frontend/tests/e2e-image-suite.test.ts` or `frontend/scripts/test-e2e.mjs`)
- Invocation: `node frontend/scripts/test-e2e.mjs` or `npm test`
- Pass/Fail Semantics: Exit code 0 if all tests pass, exit code 1 with detailed failure report if any test fails.
- Checks Performed:
  - Route compilation & AST/file structure check for `page.tsx`, `*Client.tsx`, `error.tsx` across all 5 tools
  - SEO Metadata & JSON-LD schema verification
  - Static analysis ensuring no external backend endpoints or paid API keys
  - Schema correctness in `ToolEngine.ts` for all 5 tools
  - Build test: `npm run build` execution check

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Social Media Profile Prep | `image-resize` + `image-crop` (Target 400x400 avatar) | Medium |
| 2 | Web Performance Optimization | `image-compress` + `image-to-webp` (High-res banner to <100KB WebP) | High |
| 3 | Product E-Commerce Cutout | `image-remove-bg` + `image-upscale` (Extract subject on transparent bg, 2x scale) | High |
| 4 | Print Asset Preparation | `image-upscale` + `image-resize` (Upscale 4x with sharp filtering) | High |
| 5 | Multi-Format Batch Transition | `image-to-webp` + `image-compress` (Convert and shrink for mobile) | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total ≥ 35)
- Tier 2: ≥5 per feature (Total ≥ 35)
- Tier 3: Pairwise coverage across tool combinations (Total ≥ 10)
- Tier 4: ≥5 realistic end-to-end application scenarios
- Build: `npm run build` exits 0 with 0 errors
