"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminConsole from "../../app/profile/AdminConsole";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    const e = localStorage.getItem("admin_email");
    if (!t || !e) {
      router.push("/");
    } else {
      setToken(t);
      setEmail(e);
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Botock Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_email");
              router.push("/");
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        <AdminConsole token={token} email={email} />
      </div>
    </div>
  );
}
