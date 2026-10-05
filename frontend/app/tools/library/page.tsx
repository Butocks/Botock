import type { Metadata } from "next";
import LibraryClient from "./LibraryClient";

export const metadata: Metadata = {
  title: "My Media Library",
  description: "View and manage your generated videos and downloaded media assets.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LibraryPage() {
  return <LibraryClient />;
}
