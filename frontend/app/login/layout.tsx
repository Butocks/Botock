import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Botock AI",
  description: "Sign in to your Botock AI account to create videos, generate images, and access creative suite tools.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
