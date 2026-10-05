import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ToolUnderConstructionPage() {
  // Non-implemented or invalid tool slugs should return standard 404
  // to avoid soft-404 indexing penalties on search engines.
  notFound();
}
