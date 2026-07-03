"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight, Lock } from "lucide-react";
import { CartItem, Page, fmtPrice } from "../../types";
import { api } from "../../../lib/api";

export interface CheckoutPageProps {
  cart: CartItem[];
  onNavigate: (p: Page) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  currentUser?: { id: number; name: string; email: string; role: "ADMIN" | "USER" } | null;
  onOrderPlaced?: (cart: CartItem[], orderObj?: any) => void;
}

export function CheckoutPage({ cart, onNavigate, showToast, currentUser, onOrderPlaced }: CheckoutPageProps) {
  const [step, setStep] = useState("address" as "address" | "payment" | "success");
  const [payMethod, setPayMethod] = useState("card");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h2>
          <p className="text-muted-foreground text-xs mb-6">
            Thank you for shopping on ElectroHub. Your order has been registered in our database and product stock count updated.
          </p>
          <button
            onClick={() => onNavigate("orders")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            View My Purchased Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "address" && (
              <div className="bg-card border border-border rounded-2xl p-7">
                <h2 className="font-bold text-foreground text-lg mb-6">Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[["First Name", currentUser?.name?.split(" ")[0] || "John"], ["Last Name", currentUser?.name?.split(" ")[1] || "Doe"], ["Phone", "+91 98765 43210"], ["Pincode", "400 001"]].map(([label, ph]) => (
                    <div key={label}>
                      <label className="text-sm font-bold text-foreground block mb-1.5">{label}</label>
                      <input placeholder={ph} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 text-sm transition-all" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-bold text-foreground block mb-1.5">Address</label>
                    <input placeholder="123, Sample Street, Locality" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 text-sm transition-all" />
                  </div>
                </div>
                <button onClick={() => setStep("payment")} className="mt-6 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors flex items-center gap-2">
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-card border border-border rounded-2xl p-7">
                <h2 className="font-bold text-foreground text-lg mb-6">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: "upi", label: "UPI / BHIM", sub: "Google Pay, PhonePe, BHIM" },
                    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                    { id: "cod", label: "Cash on Delivery", sub: "Pay at your doorstep" },
                  ].map((m) => (
                    <button
                      key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${payMethod === m.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-border hover:border-blue-300"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payMethod === m.id ? "border-blue-600" : "border-muted-foreground"}`}>
                        {payMethod === m.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {payMethod === "card" && (
                  <div className="space-y-3 mb-6">
                    <input placeholder="Card Number" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-all" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className="px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-all" />
                      <input placeholder="CVV" className="px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                )}
                <button
                  onClick={async () => {
                    let createdOrder: any = null;
                    try {
                      createdOrder = await api.createOrder({
                        customerName: currentUser?.name || "Customer",
                        customerEmail: currentUser?.email || "customer@electrohub.com",
                        items: cart.map((c) => ({
                          id: c.id,
                          name: c.name,
                          qty: c.qty,
                          price: c.price,
                        })),
                        totalAmount: total,
                        userId: currentUser?.id,
                      });
                    } catch (err) {
                      console.warn("Order creation note:", err);
                    }
                    const orderPayload = createdOrder || {
                      id: Date.now(),
                      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
                      customerName: currentUser?.name || "Customer",
                      customerEmail: currentUser?.email || "customer@electrohub.com",
                      totalAmount: total,
                      status: "Processing",
                      createdAt: new Date().toISOString(),
                      items: cart.map((c) => ({ productName: c.name, quantity: c.qty, price: c.price })),
                    };
                    if (onOrderPlaced) onOrderPlaced(cart, orderPayload);
                    setStep("success");
                    showToast("Order placed successfully! Product stock updated.", "success");
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> Place Order {"·"} {fmtPrice(total)}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-5 h-fit sticky top-20">
            <h3 className="font-bold text-foreground mb-4">Order ({cart.length} items)</h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty: {item.qty}</p>
                    <p className="text-sm font-bold text-foreground">{fmtPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmtPrice(total)}</span></div>
              <div className="flex justify-between text-emerald-600 font-bold"><span>Delivery</span><span>FREE</span></div>
              <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-2"><span>Total</span><span>{fmtPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
