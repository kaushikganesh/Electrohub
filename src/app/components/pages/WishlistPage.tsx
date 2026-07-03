"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { Product, Page, PRODUCTS, fmtPrice } from "../../types";
import { Stars } from "../ProductCard";

export function WishlistPage({
  wishlist, onNavigate, onToggleWishlist, onAddToCart, showToast,
}: {
  wishlist: number[]; onNavigate: (p: Page, d?: Product) => void;
  onToggleWishlist: (id: number) => void; onAddToCart: (p: Product) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const saved = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-1">My Wishlist</h1>
        <p className="text-muted-foreground mb-8 text-sm">{saved.length} {saved.length === 1 ? "item" : "items"} saved</p>

        {saved.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6"><Heart size={38} className="text-muted-foreground" /></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-7 text-sm">Save products you love to buy them later.</p>
            <button onClick={() => onNavigate("home")} className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors">Explore Products</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={() => { onToggleWishlist(p.id); showToast("Removed from wishlist", "info"); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Heart size={13} className="fill-white text-white" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{p.brand}</p>
                  <h3
                    onClick={() => onNavigate("product", p)}
                    className="font-bold text-foreground text-sm mt-0.5 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3"><Stars rating={p.rating} size={11} /><span className="text-xs text-muted-foreground">({p.reviews.toLocaleString()})</span></div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-foreground text-sm">{fmtPrice(p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{fmtPrice(p.originalPrice)}</span>
                    <span className="text-xs font-bold text-emerald-600">{p.discount}% off</span>
                  </div>
                  <button
                    onClick={() => { onAddToCart(p); showToast(`${p.name} added to cart!`, "success"); }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={14} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
