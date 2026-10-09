/**
 * BOTOCK-104 / Section 8 Reconciliation:
 * useObjectUrlLifecycle is an alias re-export of useObjectUrlDownload.
 *
 * Per audit note: "check whether BOTOCK-103's hook already covers this —
 * if so, rename/relocate it rather than shipping two near-identical hooks."
 *
 * The codebase uses `useObjectUrlDownload` consistently.
 * This file satisfies any imports using the lifecycle name.
 */
export {
  useObjectUrlDownload as useObjectUrlLifecycle,
  useObjectUrlDownload,
} from "@/lib/download/useObjectUrlDownload";

export type { UseObjectUrlDownloadReturn as UseObjectUrlLifecycleReturn } from "@/lib/download/useObjectUrlDownload";
