"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("botock-theme") as Theme) || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("botock-theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "Dark Obsidian" : "Light Simple"} Mode`}
      aria-label="Toggle Theme"
      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
    >
      {theme === "light" ? (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline font-bold">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-violet-400" />
          <span className="hidden sm:inline font-bold">Dark</span>
        </>
      )}
    </button>
  );
}
