"use client";

import { useState, useEffect } from "react";
import { Zap, Package, Shield, Truck, Sparkles, ArrowRight } from "lucide-react";

export function IntroPage({
  onProceedToLogin,
}: {
  onProceedToLogin: (mode?: "login" | "register") => void;
}) {
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  useEffect(() => {
    if (!autoRedirect || isExiting) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerExit("login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRedirect, isExiting]);

  const triggerExit = (mode: "login" | "register" = "login") => {
    setIsExiting(true);
    setTimeout(() => {
      onProceedToLogin(mode);
    }, 400);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 dark:from-slate-950 dark:via-[#0B132B] dark:to-[#060A14] text-foreground dark:text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 transition-all duration-500 ${isExiting ? "opacity-0 scale-95 filter blur-sm" : "opacity-100 scale-100"}`}>
      {/* Background Animated Glow Orbs & Particles */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 dark:bg-blue-600/20 blur-[150px] rounded-full pointer-events-none animate-intro-glow" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-violet-600/15 dark:bg-violet-600/20 blur-[130px] rounded-full pointer-events-none animate-intro-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-20 left-10 w-[350px] h-[350px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none animate-intro-glow" style={{ animationDelay: "4s" }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        {/* Intro Animated Badge */}
        <div className="animate-slide-up-1 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-blue-500/10 animate-pulse-border">
          <Zap size={15} className="text-blue-500 dark:text-blue-400 animate-bounce" /> Welcome to ElectroHub Official Store
        </div>

        {/* Website Name & Main Headline with Animated Gradient */}
        <div className="animate-slide-up-2 space-y-4">
          <div className="flex items-center justify-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 transform hover:rotate-6 transition-transform cursor-pointer animate-float-slow">
              <Zap size={34} className="text-white fill-white/20" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground dark:text-white">
              Electro<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 animate-text-shimmer">Hub</span>
            </h1>
          </div>
          <p className="text-base sm:text-xl text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Your Next-Generation Electronics & Premium Tech Marketplace
          </p>
        </div>

        {/* Introduction Feature Cards with Staggered Entrance & Hover Glow */}
        <div className="grid sm:grid-cols-3 gap-5 text-left pt-2">
          {[
            {
              id: 0,
              icon: Package,
              title: "Curated Tech",
              color: "blue",
              desc: "Explore top-tier laptops, smartphones, 4K Smart TVs, and audio gear from authorized brands.",
            },
            {
              id: 1,
              icon: Shield,
              title: "100% Genuine",
              color: "violet",
              desc: "Official manufacturer warranty coverage, direct brand support, and transparent PostgreSQL tracking.",
            },
            {
              id: 2,
              icon: Truck,
              title: "Express Shipping",
              color: "emerald",
              desc: "Fast delivery with real-time SMS & email notifications, easy 30-day returns, and 24/7 care.",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            const colors: Record<string, { bg: string; text: string; border: string }> = {
              blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-500/50 hover:shadow-blue-500/10" },
              violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "hover:border-violet-500/50 hover:shadow-violet-500/10" },
              emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-500/50 hover:shadow-emerald-500/10" },
            };
            const c = colors[item.color];

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveFeature(item.id)}
                onMouseLeave={() => setActiveFeature(null)}
                className={`animate-slide-up-3 bg-card/90 dark:bg-slate-900/60 border border-border dark:border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 shadow-xl cursor-pointer ${c.border} ${activeFeature === item.id ? "scale-105 border-blue-400/60 bg-card dark:bg-slate-900/90" : ""}`}
                style={{ animationDelay: `${0.2 + index * 0.12}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-foreground dark:text-white text-base mb-1.5 flex items-center gap-2">
                  {item.title}
                  {activeFeature === item.id && <Sparkles size={14} className="text-amber-500 dark:text-amber-400 animate-spin" />}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Primary Action Buttons & Circular Countdown */}
        <div className="animate-slide-up-4 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => triggerExit("login")}
              className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 group"
            >
              Proceed to Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => triggerExit("register")}
              className="w-full sm:w-auto px-9 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 hover:border-slate-500"
            >
              Create New Account
            </button>
          </div>

          {autoRedirect && (
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-2">
              {/* Circular SVG Timer Animation */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" className="text-slate-800" fill="transparent" />
                  <circle
                    cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5"
                    className="text-blue-500 transition-all duration-1000 ease-linear"
                    fill="transparent"
                    strokeDasharray="88"
                    strokeDashoffset={((5 - countdown) / 5) * 88}
                  />
                </svg>
                <span className="absolute font-bold text-[10px] text-blue-400">{countdown}</span>
              </div>

              <span>Redirecting to Login page in <strong className="text-blue-400 font-bold">{countdown}s</strong>...</span>
              <button
                onClick={() => setAutoRedirect(false)}
                className="text-slate-400 hover:text-white underline font-semibold ml-2 transition-colors"
              >
                Pause Timer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
