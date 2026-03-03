"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Role = "manager" | "storeKeeper";

interface AppShellProps {
  accent: "dashboard" | "products";
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ accent, title, subtitle, actions, children }: AppShellProps) {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("sloozeTheme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (ready && !user) {
      router.push("/login");
    }
  }, [ready, user, router]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // also set body background directly to avoid stale colors after toggling
    if (theme === "light") {
      root.style.setProperty("--background", "#eaf2ff"); // soft blue
      root.style.setProperty("--foreground", "#0f172a");
    } else {
      root.style.setProperty("--background", "#0b1220");
      root.style.setProperty("--foreground", "#e2e8f0");
    }
    localStorage.setItem("sloozeTheme", theme);
  }, [theme]);

  if (!ready || !user) return null;

  const role: Role = (user.role as Role) ?? "storeKeeper";

  const shellClass =
    theme === "light"
      ? "min-h-screen bg-sky-50 text-slate-900"
      : "min-h-screen bg-slate-950 text-slate-100";

  return (
    <div className={shellClass + " transition-colors duration-300"}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex-col rounded-r-3xl shadow-xl">
          <div className="px-6 py-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-lg font-semibold shadow-lg">
              S
            </div>
            <div className="text-xl font-semibold tracking-wide">Slooze</div>
          </div>
          <nav className="flex-1 px-3">
            {role === "manager" && (
              <button
                onClick={() => router.push("/dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition ${
                  accent === "dashboard" ? "bg-white/15 border border-white/15 shadow-inner" : "hover:bg-white/10"
                }`}
              >
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </button>
            )}
            <button
              onClick={() => router.push("/products")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition ${
                accent === "products" ? "bg-white/15 border border-white/15 shadow-inner" : "hover:bg-white/10"
              }`}
            >
              <span className="text-lg">📦</span>
              <span>Products</span>
            </button>
          </nav>
          <div className="px-4 pb-6 mt-auto">
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl hover:bg-white/10 transition"
            >
              <span className="text-lg">↩️</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 p-4 md:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 px-5 py-4 shadow-sm transition-colors duration-300">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle && <p className="text-slate-600 dark:text-slate-300">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                {actions}
                <button
                  onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-emerald-400 hover:text-emerald-700 shadow-sm transition"
                >
                  {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</div>
                  <div className="text-slate-500 dark:text-slate-300 capitalize">{role === "manager" ? "Manager" : "Store Keeper"}</div>
                </div>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm rounded-2xl p-[1px] bg-gradient-to-br from-slate-200 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-2xl">
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50">
              <div className="text-lg font-semibold">Logout?</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Are you sure you want to end this session?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConfirmLogout(false); logout(); router.push("/login"); }}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
