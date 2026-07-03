"use client";

import { useState } from "react";
import { Cpu, ShoppingCart, Mail, Send, Zap, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Product, Page, fmtPrice } from "../types";

export function AIRecommendations({
  products, onNavigate, onAddToCart, showToast,
}: {
  products: Product[]; onNavigate: (p: Page, d?: Product) => void;
  onAddToCart: (p: Product) => void; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-700 to-blue-900 dark:from-blue-950 dark:to-indigo-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Powered by AI</p>
            <h2 className="text-3xl font-bold text-white">Recommended For You</h2>
          </div>
        </div>
        <p className="text-blue-300 mb-10 text-sm ml-1">Based on your browsing history and preferences</p>
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[...products].reverse().map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate("product", p)}
              className="flex-shrink-0 w-52 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden hover:bg-white/18 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="h-40 overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-[11px] text-blue-300 font-semibold">{p.brand}</p>
                <h4 className="text-white font-bold text-sm mt-0.5 leading-snug">{p.name}</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-white font-bold text-sm">{fmtPrice(p.price)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(p); showToast(`${p.name} added!`, "success"); }}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <ShoppingCart size={13} className="text-blue-700" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="py-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail size={26} className="text-blue-600" />
        </div>
        <h2 className="text-4xl font-bold text-foreground tracking-tight mb-3">Stay in the Loop</h2>
        <p className="text-muted-foreground mb-8">Exclusive deals, new arrivals, and tech news — delivered to your inbox. No spam, ever.</p>
        <div className="flex gap-3">
          <input
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-5 py-3.5 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
          <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors flex items-center gap-2 whitespace-nowrap">
            Subscribe <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Join 50,000+ subscribers. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

export function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="bg-[#060B17] text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Zap size={17} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">Electro<span className="text-blue-400">Hub</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-6">Premium electronics marketplace with AI-powered recommendations. Quality guaranteed, satisfaction assured.</p>
            <div className="flex gap-2.5">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-white/5 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 group">
                  <Icon size={16} className="group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
          {[
            {
              title: "Quick Links",
              links: [{ l: "Home", p: "home" as Page }, { l: "Products", p: "product" as Page }, { l: "Contact Us", p: "contact" as Page }, { l: "Help Center", p: "help" as Page }],
            },
            {
              title: "My Account",
              links: [{ l: "Dashboard", p: "dashboard" as Page }, { l: "My Orders", p: "orders" as Page }, { l: "Wishlist", p: "wishlist" as Page }, { l: "My Cart", p: "cart" as Page }],
            },
            {
              title: "Support",
              links: [{ l: "FAQ", p: "help" as Page }, { l: "Contact Support", p: "help" as Page }, { l: "Raise a Ticket", p: "help" as Page }, { l: "Returns Policy", p: "help" as Page }],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(({ l, p }) => (
                  <li key={l}>
                    <button onClick={() => onNavigate(p)} className="text-sm hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/8 pt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>© 2025 ElectroHub Technologies. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((t) => (
              <button key={t} className="hover:text-white transition-colors">{t}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
