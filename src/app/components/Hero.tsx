"use client";

import { useState, useEffect } from "react";
import { Zap, ArrowRight, Star } from "lucide-react";
import { Page, Product, PRODUCTS, fmtPrice } from "../types";

export function Hero({ onNavigate }: { onNavigate: (p: Page, d?: Product) => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { headline: "The Future of Electronics", accent: "is Here.", product: PRODUCTS[0], grad: "from-blue-600 to-violet-600" },
    { headline: "Sound That Moves You", accent: "Profoundly.", product: PRODUCTS[3], grad: "from-violet-600 to-pink-600" },
    { headline: "Pro Camera. Pro Display.", accent: "Pro.", product: PRODUCTS[4], grad: "from-slate-700 to-slate-900" },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  const { headline, accent, product, grad } = slides[slide];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 dark:from-[#080D1A] dark:via-[#0D1526] dark:to-[#080D1A]">
      {/* Background ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #2563EB 1px, transparent 1px)", backgroundSize: "44px 44px" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-16 items-center min-h-screen">
        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-7">
            <Zap size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">AI-Powered Shopping Experience</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold text-foreground leading-[1.08] tracking-tight mb-6">
            {headline}{" "}
            <span className={`bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{accent}</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
            {product.description.split(".")[0]}. Discover premium technology, hand-picked for the discerning buyer.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => onNavigate("product")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Explore Products <ArrowRight size={18} />
            </button>
            <button className="px-8 py-4 bg-card/80 backdrop-blur-sm hover:bg-card text-foreground font-bold rounded-2xl border border-border transition-all hover:-translate-y-0.5">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 mb-8">
            {[["50K+", "Happy Customers"], ["1,000+", "Products"], ["4.9★", "Avg Rating"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-bold text-foreground">{v}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i} onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-blue-600" : "w-2.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>

        {/* Product visual */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-lg aspect-square">
            <div className="absolute inset-6 bg-gradient-to-br from-blue-400/15 to-violet-400/15 rounded-3xl blur-2xl" />
            <div className="relative h-full bg-card/70 backdrop-blur-md border border-border/60 rounded-3xl overflow-hidden flex items-center justify-center p-8 shadow-2xl">
              <img
                src={product.image} alt={product.name}
                className="w-full h-full object-contain transition-all duration-700"
                style={{ maxHeight: 400 }}
              />
            </div>
            {/* Floating price card */}
            <div className="absolute -bottom-5 -left-5 bg-card border border-border rounded-2xl px-5 py-4 shadow-xl min-w-[180px]">
              <p className="text-[11px] text-muted-foreground font-semibold">{product.brand}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{product.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-blue-600 font-bold text-sm">{fmtPrice(product.price)}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">{product.discount}% off</span>
              </div>
            </div>
            {/* Floating rating */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-foreground">{product.rating}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{product.reviews.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <span className="text-[11px] text-muted-foreground tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-7 border border-muted-foreground/40 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
