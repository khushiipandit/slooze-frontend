"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const ripplesRef = useRef<{ x: number; y: number; start: number }[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Sync with portal theme
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("sloozeTheme") : null;
    if (stored === "light" || stored === "dark") {
      queueMicrotask(() => setTheme(stored));
    }
  }, []);

  // Interactive water ripple background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripplesRef.current = ripplesRef.current.filter((r) => time - r.start < 900);
      ripplesRef.current.forEach((r) => {
        const progress = (time - r.start) / 900;
        const radius = 20 + progress * 140;
        const alpha = Math.max(0, 0.35 * (1 - progress));
        const gradient = ctx.createRadialGradient(r.x, r.y, radius * 0.2, r.x, r.y, radius);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      animationRef.current = requestAnimationFrame(draw);
    };
    animationRef.current = requestAnimationFrame(draw);

    const handleMove = (e: PointerEvent) => {
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, start: performance.now() });
    };
    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const result = login(email, password);

    if (result.success) {
      if (result.role === "manager") {
        router.push("/dashboard");
      } else {
        router.push("/products");
      }
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      theme === "light"
        ? "bg-gradient-to-br from-[#eaf2ff] via-[#f4f8ff] to-[#dfeeff]"
        : "bg-slate-950"
    }`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen" />
      <div className={`backdrop-blur-xl p-8 rounded-2xl w-96 relative z-10 transition-colors border shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] ${
        theme === "light"
          ? "bg-white/90 text-slate-900 border-white/70"
          : "bg-slate-900/95 text-slate-50 border-slate-700"
      }`}>
        <div className="absolute inset-[-14px] rounded-3xl bg-[conic-gradient(from_0deg,#5b8dff,#7cf3ff,#5b8dff)] blur-2xl opacity-60 animate-[spin_8s_linear_infinite] -z-10" aria-hidden />
        <div className="absolute inset-[-6px] rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(124,243,255,0.45),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(91,141,255,0.35),transparent_50%)] blur-xl opacity-70 -z-10" aria-hidden />
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Slooze Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              Email
            </label>
            <input
              type="email"
              placeholder="manager@slooze.com"
              className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              Password
            </label>
            <input
              type="password"
              placeholder="123456"
              className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Login
        </button>
        </form>

        <div className="mt-6 text-xs text-slate-200 text-center drop-shadow-sm">
          <span className="font-semibold text-slate-100">Demo Credentials:</span><br />
          <span className="text-slate-100">Manager → manager@slooze.com / 123456</span><br />
          <span className="text-slate-100">Store → store@slooze.com / 123456</span>
        </div>
      </div>
    </div>
  );
}
