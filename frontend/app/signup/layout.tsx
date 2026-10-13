import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Botock AI",
  description: "Create your free Botock AI account to generate cinematic videos, photorealistic images, and use tools.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
