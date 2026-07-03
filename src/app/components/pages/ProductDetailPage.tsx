"use client";

import { useState } from "react";
import { Stars, Badge } from "../ProductCard";
import { ChevronRight, ShoppingCart, Heart, Minus, Plus, Truck, RefreshCw, Shield, ThumbsUp, Share2 } from "lucide-react";
import { Product, Page, PRODUCTS, fmtPrice } from "../../types";

export function ProductDetailPage({
  product, onNavigate, onAddToCart, onToggleWishlist, wishlist, showToast,
}: {
  product: Product; onNavigate: (p: Page, d?: Product) => void;
  onAddToCart: (p: Product) => void; onToggleWishlist: (id: number) => void;
  wishlist: number[]; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"specs" | "reviews" | "warranty">("specs");
  const [thumb, setThumb] = useState(0);
  const wishlisted = wishlist.includes(product.id);

  const reviews = [
    { name: "Rahul Sharma", rating: 5, date: "Dec 2024", text: "Absolutely premium. Exceeded every expectation. Fast delivery, perfect packaging.", verified: true },
    { name: "Priya Nair", rating: 4, date: "Nov 2024", text: "Very good overall. Build quality is excellent. Slightly pricey but worth it for the quality.", verified: true },
    { name: "Arjun Mehta", rating: 5, date: "Oct 2024", text: "Best purchase in years. Performs flawlessly. Highly recommend to everyone without hesitation.", verified: true },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 flex-wrap">
          <button onClick={() => onNavigate("home")} className="hover:text-foreground transition-colors">Home</button>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">{product.category || "Electronics"}</span>
          <ChevronRight size={12} />
          <span className="text-blue-600 font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 mb-20">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-card border border-border rounded-3xl overflow-hidden flex items-center justify-center p-10 mb-4">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setThumb(i)}
                  className={`aspect-square rounded-2xl overflow-hidden bg-muted border-2 transition-all ${thumb === i ? "border-blue-500" : "border-transparent hover:border-blue-300"}`}
                >
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.badge && <div className="mb-3"><Badge text={product.badge} /></div>}
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-1">{product.name}</h1>
            <p className="text-muted-foreground font-semibold text-sm mb-4">{product.brand}</p>

            <div className="flex items-center gap-3 mb-6">
              <Stars rating={product.rating} size={16} />
              <span className="text-sm text-muted-foreground">({product.reviews.toLocaleString()} verified reviews)</span>
              <Badge text="In Stock" variant="green" />
            </div>

            <div className="flex items-end gap-3 pb-6 mb-6 border-b border-border">
              <span className="text-4xl font-bold text-foreground">{fmtPrice(product.price)}</span>
              <span className="text-muted-foreground line-through mb-1">{fmtPrice(product.originalPrice)}</span>
              <span className="text-emerald-600 font-bold mb-1">{product.discount}% off</span>
            </div>

            <p className="text-muted-foreground leading-relaxed text-sm mb-7">{product.description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-5 mb-6">
              <span className="text-sm font-semibold text-foreground">Quantity</span>
              <div className="flex items-center gap-0 bg-muted rounded-xl overflow-hidden border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-accent transition-colors text-foreground">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-foreground text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 hover:bg-accent transition-colors text-foreground">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-7">
              <button
                onClick={() => { onAddToCart(product); showToast(`${product.name} added to cart!`, "success"); }}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                onClick={() => { onAddToCart(product); onNavigate("checkout"); }}
                className="flex-1 py-4 bg-foreground text-background font-bold rounded-2xl transition-all hover:-translate-y-0.5"
              >
                Buy Now
              </button>
              <button
                onClick={() => { onToggleWishlist(product.id); showToast(wishlisted ? "Removed from wishlist" : "Saved to wishlist!", wishlisted ? "info" : "success"); }}
                className={`w-14 rounded-2xl border-2 flex items-center justify-center transition-all ${wishlisted ? "border-red-400 bg-red-50 dark:bg-red-900/10 text-red-500" : "border-border text-muted-foreground hover:border-red-300 hover:text-red-500"}`}
              >
                <Heart size={20} className={wishlisted ? "fill-red-500" : ""} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Delivery", sub: "Orders ₹999+" },
                { icon: RefreshCw, label: "30-Day Return", sub: "Easy returns" },
                { icon: Shield, label: "2-Yr Warranty", sub: "Manufacturer" },
              ].map((f) => (
                <div key={f.label} className="bg-muted/60 rounded-2xl p-3 text-center">
                  <f.icon size={17} className="mx-auto mb-1 text-blue-600" />
                  <p className="text-[11px] font-bold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8 flex gap-8">
          {(["specs", "reviews", "warranty"] as const).map((t) => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`pb-4 text-sm font-bold capitalize transition-all ${tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "reviews" ? `Reviews (${product.reviews.toLocaleString()})` : t === "specs" ? "Specifications" : "Warranty & Returns"}
            </button>
          ))}
        </div>

        {tab === "specs" && product.specs && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-2xl">
            {Object.entries(product.specs).map(([k, v], i) => (
              <div key={k} className={`flex items-center px-6 py-4 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                <span className="w-44 text-sm font-semibold text-muted-foreground">{k}</span>
                <span className="text-sm text-foreground font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "reviews" && (
          <div className="space-y-4 max-w-2xl">
            {reviews.map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">{r.name[0]}</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={r.rating} size={11} />
                        {r.verified && <span className="text-[11px] text-emerald-600 font-semibold">✓ Verified</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ThumbsUp size={12} /> Helpful</button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><Share2 size={12} /> Share</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "warranty" && (
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl">
            {[
              { icon: Shield, title: "Manufacturer Warranty", desc: "2-year comprehensive warranty covering all defects and hardware failures.", col: "blue" },
              { icon: RefreshCw, title: "30-Day Returns", desc: "Return within 30 days in original condition for a full, no-questions-asked refund.", col: "emerald" },
              { icon: Truck, title: "Insured Delivery", desc: "Products insured during transit. Damage during shipping covered at zero cost to you.", col: "violet" },
            ].map((item) => {
              const cc: Record<string, string> = {
                blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
                violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
              };
              return (
                <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-2xl ${cc[item.col]} flex items-center justify-center mb-4`}>
                    <item.icon size={22} />
                  </div>
                  <h4 className="font-bold text-foreground mb-2 text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Related */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.filter((p) => p.id !== product.id).map((p) => (
              <button
                key={p.id} onClick={() => onNavigate("product", p)}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-semibold">{p.brand}</p>
                  <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">{fmtPrice(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
