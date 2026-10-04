"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Activity, Users, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";

export default function DaddyPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check Supabase Auth FIRST
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email?.toLowerCase() || "";
      if (email === "butoameerali@gmail.com" || email === "butoameerali@gmai.com") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setCheckingAuth(false);
    });
  }, []);

  // Check if already authenticated via localStorage
  useEffect(() => {
    if (!checkingAuth && isAuthorized) {
      const savedKey = localStorage.getItem("daddy_key");
      if (savedKey) {
        checkKey(savedKey);
      }
    }
  }, [checkingAuth, isAuthorized]);

  const checkKey = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/api/admin/stats", {
        headers: { "admin-api-key": key }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setIsAuthenticated(true);
        localStorage.setItem("daddy_key", key);
        setError("");
      } else {
        setError("Access Denied.");
        setIsAuthenticated(false);
        localStorage.removeItem("daddy_key");
      }
    } catch (err) {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    checkKey(password);
  };

  if (checkingAuth) {
    return <div className="min-h-screen bg-background"></div>; // Blank while checking
  }

  if (!isAuthorized) {
    // Fake 404 to hide the page completely from unauthorized users
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center font-sans">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white border-r border-slate-300 dark:border-slate-700 pr-6">404</h1>
          <h2 className="text-sm font-normal text-slate-700 dark:text-slate-300">This page could not be found.</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500"></div>
          <Lock className="w-12 h-12 text-slate-800 dark:text-slate-200 mx-auto mb-4 opacity-50" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white mb-6">Restricted Area</h1>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Passkey..."
            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-center mb-4 text-slate-900 dark:text-white"
            autoFocus
          />
          
          {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}
          
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daddy Control Panel</h1>
        </div>
        <button 
          onClick={() => { localStorage.removeItem("daddy_key"); setIsAuthenticated(false); }}
          className="text-xs font-bold text-slate-500 hover:text-red-500"
        >
          Lock System
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#111114] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">TOTAL USERS</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.users || 0}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#111114] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">GENERATIONS</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.generations || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111114] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">SYSTEM STATUS</p>
            <p className="text-xl font-black text-emerald-500">Online</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#111114] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Advanced Settings</h2>
        <p className="text-sm text-slate-500">Connected to Backend API: {stats?.message}</p>
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 text-sm font-semibold">
          More admin controls (like user bans, credit management) can be added here connecting to /api/proxy/api/admin/...
        </div>
      </div>
    </div>
  );
}
