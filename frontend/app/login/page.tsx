import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next || "/";
  const errorParam = params?.error ? `?error=${encodeURIComponent(params.error)}` : "";
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(`${destination}${errorParam}`);
}
