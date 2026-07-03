"use client";

import { Star, Heart, Eye } from "lucide-react";
import { Product, Page, fmtPrice } from "../types";

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i} size={size}
          className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}
        />
      ))}
    </div>
  );
}

export function Badge({ text, variant = "blue" }: { text: string; variant?: "blue" | "green" | "amber" | "red" | "violet" }) {
  const cls: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${cls[variant]}`}>{text}</span>;
}

export function ProductCard({
  product, onNavigate, onAddToCart, onToggleWishlist, wishlist, showToast,
}: {
  product: Product; onNavigate: (p: Page, d?: Product) => void;
  onAddToCart: (p: Product) => void; onToggleWishlist: (id: number) => void;
  wishlist: number[]; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const wishlisted = wishlist.includes(product.id);
  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 transition-all duration-300 hover:-translate-y-1.5">
      <div className="relative overflow-hidden bg-muted h-52">
        <img
          src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge text={product.badge} />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => { onToggleWishlist(product.id); showToast(wishlisted ? "Removed from wishlist" : "Saved to wishlist!", wishlisted ? "info" : "success"); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${wishlisted ? "bg-red-500 text-white" : "bg-white/95 text-gray-500 hover:text-red-500 hover:bg-red-50"}`}
          >
            <Heart size={13} className={wishlisted ? "fill-white" : ""} />
          </button>
          <button
            onClick={() => onNavigate("product", product)}
            className="w-8 h-8 rounded-full bg-white/95 text-gray-500 flex items-center justify-center hover:text-blue-600 hover:bg-blue-50 transition-all shadow-lg"
          >
            <Eye size={13} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 flex gap-2 bg-gradient-to-t from-black/30 to-transparent">
          <button
            onClick={() => { onAddToCart(product); showToast(`${product.name} added to cart!`, "success"); }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => { onAddToCart(product); onNavigate("checkout"); }}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold py-2.5 rounded-xl border border-white/20 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{product.brand}</p>
        <h3
          className="font-semibold text-foreground text-sm leading-snug mb-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onNavigate("product", product)}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} size={11} />
          <span className="text-[11px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-end gap-1.5 flex-wrap">
          <span className="text-base font-bold text-foreground">{fmtPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{fmtPrice(product.originalPrice)}</span>
          <span className="text-xs font-bold text-emerald-600">{product.discount}% off</span>
        </div>
        <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">● In Stock · Free Delivery</p>
      </div>
    </div>
  );
}
