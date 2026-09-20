import { createClient } from "../../utils/supabase/server";
import NotFound from "../not-found";
import ConsoleView from "./ConsoleView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedAdmins = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    "butoameerali@gmail.com,creator@botock.ai,owner@botock.com,admin@botock.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!user || !user.email || !allowedAdmins.includes(user.email.toLowerCase())) {
    return <NotFound />;
  }

  return <ConsoleView initialUserEmail={user.email} />;
}
