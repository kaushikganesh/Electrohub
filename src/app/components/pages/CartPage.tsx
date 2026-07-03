"use client";

import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { CartItem, Page, fmtPrice } from "../../types";

export function CartPage({
  cart, onUpdateQty, onRemove, onNavigate, showToast,
}: {
  cart: CartItem[]; onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void; onNavigate: (p: Page) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const delivery = subtotal > 99900 ? 0 : 4999;
  const disc = Math.round(subtotal * 0.05);
  const total = subtotal + delivery - disc;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={38} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-7 text-sm">Add amazing products to get started.</p>
          <button onClick={() => onNavigate("home")} className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors">Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Shopping Cart <span className="text-muted-foreground text-xl font-normal">({cart.length} {cart.length === 1 ? "item" : "items"})</span>
        </h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-5 flex gap-5">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{item.brand}</p>
                  <h3 className="font-bold text-foreground mt-0.5 mb-1 text-sm">{item.name}</h3>
                  <p className="text-xs text-emerald-600 font-semibold mb-3">● In Stock</p>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button onClick={() => { if (item.qty > 1) onUpdateQty(item.id, item.qty - 1); }} className="px-3.5 py-2.5 hover:bg-muted transition-colors text-foreground"><Minus size={13} /></button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="px-3.5 py-2.5 hover:bg-muted transition-colors text-foreground"><Plus size={13} /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">{fmtPrice(item.price * item.qty)}</span>
                      <button onClick={() => { onRemove(item.id); showToast("Item removed", "info"); }} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-20">
              <h2 className="font-bold text-foreground text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.qty, 0)} items)</span>
                  <span>{fmtPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span>{fmtPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}</span>
                </div>
              </div>
              <button onClick={() => onNavigate("checkout")} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                Checkout <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
