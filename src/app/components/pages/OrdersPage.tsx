"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Package } from "lucide-react";
import { Page, fmtPrice } from "../../types";
import { Badge } from "../ProductCard";
import { api } from "../../../lib/api";

export interface OrdersPageProps {
  currentUser?: { id: number; name: string; email: string; role: "ADMIN" | "USER" } | null;
  userPurchasedOrders?: any[];
  onNavigate: (p: Page) => void;
}

export function OrdersPage({ currentUser, userPurchasedOrders = [], onNavigate }: OrdersPageProps) {
  const [ordersList, setOrdersList] = useState(userPurchasedOrders);

  useEffect(() => {
    const userEmailLower = currentUser?.email?.toLowerCase();
    const userId = currentUser?.id;
    api.getOrders().then((res) => {
      let combined = [...userPurchasedOrders];
      if (res && Array.isArray(res)) {
        res.forEach((o: any) => {
          if (!combined.some((c: any) => c.orderNumber === o.orderNumber || c.id === o.id)) {
            combined.push(o);
          }
        });
      }
      if (userEmailLower) {
        const userOrders = combined.filter(
          (o: any) =>
            !o.customerEmail ||
            o.customerEmail.toLowerCase() === userEmailLower ||
            (userId && o.userId === userId)
        );
        setOrdersList(userOrders);
      } else {
        setOrdersList(combined);
      }
    });
  }, [currentUser, userPurchasedOrders]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate("dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Purchased Orders</h1>
            <p className="text-xs text-muted-foreground">Orders registered for {currentUser?.email || "your account"}</p>
          </div>
        </div>

        {ordersList.length === 0 ? (
          <div className="text-center py-24 bg-card border border-border rounded-3xl p-8">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No purchased orders yet</h3>
            <p className="text-muted-foreground text-xs mb-6">Select a product and click Buy Now or Checkout to place your order.</p>
            <button onClick={() => onNavigate("home")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersList.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-500">{o.orderNumber || `#ORD-${o.id}`}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Purchased on: {new Date(o.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground text-sm">{fmtPrice(o.totalAmount)}</span>
                    <div className="mt-1">
                      <Badge text={o.status || "Processing"} variant={o.status === "Delivered" ? "green" : "amber"} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {o.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border text-xs">
                      <div>
                        <p className="font-bold text-foreground">{it.productName}</p>
                        <p className="text-[11px] text-muted-foreground">Quantity: {it.quantity}</p>
                      </div>
                      <span className="font-bold text-foreground">{fmtPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
