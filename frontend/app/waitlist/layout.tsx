import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waitlist | Botock AI",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
