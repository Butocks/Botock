import { createClient } from "../../utils/supabase/server";
import NotFound from "../not-found";
import ConsoleView from "./ConsoleView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const allowedAdmins = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user || !user.email || allowedAdmins.length === 0 || !allowedAdmins.includes(user.email.toLowerCase())) {
    return <NotFound />;
  }

  return <ConsoleView initialUserEmail={user.email} />;
}
