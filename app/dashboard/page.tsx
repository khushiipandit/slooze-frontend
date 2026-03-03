"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { useProducts } from "@/context/ProductContext";

type Role = "manager" | "storeKeeper";

function stockBucket(stock: number) {
  if (stock >= 20) return "healthy";
  if (stock >= 5) return "low";
  return "critical";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { products, stats, lowItems } = useProducts();

  const role: Role = (user?.role as Role) ?? "storeKeeper";

  useEffect(() => {
    if (!user) return;
    if (role !== "manager") {
      router.replace("/products");
    }
  }, [user, role, router]);

  const metrics = useMemo(() => {
    const totalUnitsFloat = stats.totalUnits || 1;
    const sums = products.reduce(
      (acc, p) => {
        const bucket = stockBucket(p.stock);
        acc[bucket] += p.stock;
        return acc;
      },
      { healthy: 0, low: 0, critical: 0 }
    );

    return {
      ...stats,
      percHealthy: Math.round((sums.healthy / totalUnitsFloat) * 100),
      percLow: Math.round((sums.low / totalUnitsFloat) * 100),
      percCritical: Math.round((sums.critical / totalUnitsFloat) * 100),
      lowItems,
    };
  }, [products, stats, lowItems]);

  if (!user || role !== "manager") {
    return null;
  }

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const badge = (color: string, label: string, value: number | string, icon: string) => (
    <div className="flex items-center gap-3 px-5 py-4 bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );

  const bar = (label: string, value: number, color: string) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <AppShell accent="dashboard" title="Dashboard" subtitle="Operational overview of commodities">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {badge("bg-emerald-100 text-emerald-700", "Total Products", metrics.totalProducts, "📦")}
            {badge("bg-amber-100 text-amber-700", "Low Stock Items", metrics.lowStock, "⚠️")}
            {badge("bg-red-100 text-red-700", "Critical Stock", metrics.criticalStock, "⛔")}
            {badge("bg-sky-100 text-sky-700", "Total Inventory Units", metrics.totalUnits, "📊")}
          </div>

          {/* Inventory health */}
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors duration-300">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inventory Health</div>
            <div className="space-y-3">
              {bar("Healthy Stock", metrics.percHealthy, "bg-emerald-500")}
              {bar("Low Stock", metrics.percLow, "bg-amber-400")}
              {bar("Critical Stock", metrics.percCritical, "bg-red-500")}
            </div>
          </div>

          {/* Attention table */}
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-300">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Attention Needed</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-slate-500 dark:text-slate-300">
                    <th className="py-2">Commodity</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {metrics.lowItems.map((item) => {
                    const status = stockBucket(item.stock);
                    const label = status === "critical" ? "Critical" : "Low Stock";
                    const pill =
                      status === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200";
                    return (
                      <tr key={item.id} className="text-slate-800 dark:text-slate-100">
                        <td className="py-3 flex items-center gap-3">
                          <span className="text-xl">{item.emoji}</span>
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.category}</div>
                          </div>
                        </td>
                        <td className="py-3">{item.stock}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${pill}`}>
                            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
              <span>Manager</span>
              <span>{today}</span>
            </div>
            <div className="space-y-3">
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Low Stock Items</div>
              <div className="space-y-2">
                {metrics.lowItems.map((item) => {
                  const status = stockBucket(item.stock);
                  const pill =
                    status === "critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200";
                  const label = status === "critical" ? "Critical" : "Low Stock";
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        {item.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <span>{item.stock}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pill}`}>{label}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-3 transition-colors duration-300">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</div>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/products")}
                className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">＋</span>
                  Add Product
                </span>
              </button>
              <button
                onClick={() => router.push("/products")}
                className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-emerald-400 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  Go to Products
                </span>
              </button>
              <button
                className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  Export Report
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
