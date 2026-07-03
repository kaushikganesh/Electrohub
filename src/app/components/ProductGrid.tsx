"use client";

import { ChevronRight, Truck, Shield, RotateCcw, MessageSquare, Award, CreditCard } from "lucide-react";
import { Product, Page } from "../types";
import { ProductCard } from "./ProductCard";

export function FeaturedProducts({
  products, onNavigate, onAddToCart, onToggleWishlist, wishlist, showToast,
}: {
  products: Product[]; onNavigate: (p: Page, d?: Product) => void;
  onAddToCart: (p: Product) => void; onToggleWishlist: (id: number) => void;
  wishlist: number[]; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Our Collection</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground mt-2 text-base">Hand-picked premium electronics for the discerning buyer</p>
          </div>
          <button
            onClick={() => onNavigate("product")}
            className="hidden sm:flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
          >
            View All <ChevronRight size={17} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id} product={p} onNavigate={onNavigate} onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist} wishlist={wishlist} showToast={showToast}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose() {
  const features = [
    { icon: Truck, title: "Free Delivery", desc: "Free shipping on all orders above ₹999. Express 1-2 day delivery available.", color: "blue" },
    { icon: Shield, title: "2-Year Warranty", desc: "Comprehensive manufacturer warranty with extended coverage on all products.", color: "violet" },
    { icon: RotateCcw, title: "30-Day Returns", desc: "Hassle-free returns within 30 days. Full refund, no questions asked.", color: "emerald" },
    { icon: MessageSquare, title: "24/7 Support", desc: "Round-the-clock customer care via live chat, phone, or email.", color: "amber" },
    { icon: Award, title: "Certified Genuine", desc: "100% authentic products sourced directly from authorized manufacturers.", color: "rose" },
    { icon: CreditCard, title: "Secure Payments", desc: "PCI-DSS compliant. Pay via UPI, card, EMI, net banking, or cash on delivery.", color: "indigo" },
  ];
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  return (
    <section className="py-24 bg-muted/30 dark:bg-[#0A1020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Why ElectroHub</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-3">Shopping Made Premium</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">We go beyond selling electronics — we deliver an experience worth coming back to.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
