"use client";

import { useState, useEffect } from "react";
import { Grid, Package, Heart, ShoppingCart, Bell, Tag, User, Settings, LogOut, Award, MapPin, HelpCircle } from "lucide-react";
import { Page, CartItem, PRODUCTS, fmtPrice } from "../../types";
import { Badge } from "../ProductCard";

export function DashboardPage({
  currentUser, onNavigate, cart, wishlist, onLogout, userPurchasedOrders = [],
}: {
  currentUser: { id: number; name: string; email: string; role: "ADMIN" | "USER" } | null;
  onNavigate: (p: Page) => void; cart: CartItem[]; wishlist: number[];
  onLogout?: () => void; userPurchasedOrders?: any[];
}) {
  const [sideActive, setSideActive] = useState("dashboard");
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  const userName = currentUser?.name || "User Account";
  const userEmail = currentUser?.email || "user@example.com";
  const userInitial = userName[0]?.toUpperCase() || "U";
  const firstName = userName.split(" ")[0];

  useEffect(() => {
    if (typeof window !== "undefined" && userEmail) {
      const key = `electrohub_user_notifications_${userEmail.trim().toLowerCase()}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setUserNotifications(JSON.parse(stored));
        } catch {
          setUserNotifications([]);
        }
      } else {
        setUserNotifications([]);
      }
    }
  }, [userEmail, sideActive]);

  const sideItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid },
    { id: "orders", label: "My Orders", icon: Package, page: "orders" as Page },
    { id: "wishlist", label: "Wishlist", icon: Heart, page: "wishlist" as Page },
    { id: "cart", label: "My Cart", icon: ShoppingCart, page: "cart" as Page },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "profile", label: "Profile", icon: User, page: "profile" as Page },
    { id: "settings", label: "Settings", icon: Settings, page: "settings" as Page },
  ];

  const totalSpent = userPurchasedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const rewardPoints = Math.round(totalSpent * 0.05);

  const statusVariant = (s: string): "green" | "blue" | "amber" =>
    s === "Delivered" ? "green" : s === "In Transit" ? "blue" : "amber";

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-[#080D1A] pt-16 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed top-16 bottom-0 overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-base font-bold">
              {userInitial}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold mt-0.5 inline-block">
                ⭐ {currentUser?.role === "ADMIN" ? "Administrator" : "Member"}
              </span>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {sideItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { "page" in item ? onNavigate(item.page!) : setSideActive(item.id); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${sideActive === item.id ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <item.icon size={16} /> {item.label}
              {item.id === "notifications" && userNotifications.length > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {userNotifications.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              if (onLogout) onLogout();
              onNavigate("auth");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, {firstName}! 👋</h1>
          <p className="text-muted-foreground text-sm mb-8">Here's your personal shopping overview ({userEmail}).</p>

          {sideActive === "notifications" ? (
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                    <p className="text-xs text-muted-foreground">Personal activity & order alerts for {userEmail}</p>
                  </div>
                </div>
                {userNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && userEmail) {
                        localStorage.removeItem(`electrohub_user_notifications_${userEmail.trim().toLowerCase()}`);
                        setUserNotifications([]);
                      }
                    }}
                    className="text-xs text-red-500 hover:underline font-semibold"
                  >
                    Clear Notifications
                  </button>
                )}
              </div>

              {userNotifications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <Bell size={28} />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Notifications bar is empty</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    You have no notifications right now. Activity alerts (such as order updates or profile changes) for <strong className="text-foreground">{userEmail}</strong> will appear here exclusively.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {userNotifications.map((n: any) => (
                    <div key={n.id} className="py-4 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block">{n.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Orders", value: String(userPurchasedOrders.length), icon: Package, note: "Your orders", col: "blue" },
                  { label: "Wishlist", value: String(wishlist.length), icon: Heart, note: "Saved items", col: "red" },
                  { label: "Cart Items", value: String(cartCount), icon: ShoppingCart, note: "Ready to checkout", col: "violet" },
                  { label: "Reward Pts", value: String(rewardPoints), icon: Award, note: "Earned from purchases", col: "amber" },
                ].map((s) => {
                  const cc: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                    red: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
                    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                  };
                  return (
                    <div key={s.label} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-xl ${cc[s.col]} flex items-center justify-center mb-3`}><s.icon size={18} /></div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{s.note}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent orders */}
              <div className="bg-card border border-border rounded-2xl mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-bold text-foreground">Recent Orders</h2>
                  <button onClick={() => onNavigate("orders")} className="text-xs text-blue-600 hover:underline font-semibold">View All</button>
                </div>
                {userPurchasedOrders.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
                      <Package size={24} />
                    </div>
                    <p className="font-bold text-foreground text-sm">No Recent Orders</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      You haven't placed any orders yet. When you buy products, your real orders will appear here.
                    </p>
                    <button onClick={() => onNavigate("product")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors">
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {userPurchasedOrders.slice(0, 3).map((o: any) => (
                      <div key={o.id} className="flex items-center gap-4 px-6 py-4">
                        <img src={o.items?.[0]?.image || PRODUCTS[0].image} alt={o.items?.[0]?.name || "Product"} className="w-14 h-14 rounded-xl object-cover bg-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm">{o.items?.[0]?.name || "ElectroHub Order"}</p>
                          <p className="text-xs text-muted-foreground">#ORD-{o.id} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Today"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm">{fmtPrice(o.totalAmount)}</p>
                          <Badge text={o.status || "Processing"} variant={statusVariant(o.status || "Processing")} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Browse Products", icon: Grid, fn: () => onNavigate("product") },
                  { label: "Track Order", icon: MapPin, fn: () => onNavigate("orders") },
                  { label: "My Wishlist", icon: Heart, fn: () => onNavigate("wishlist") },
                  { label: "Get Support", icon: HelpCircle, fn: () => onNavigate("help") },
                ].map((a) => (
                  <button
                    key={a.label} onClick={a.fn}
                    className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-2.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 flex items-center justify-center text-muted-foreground group-hover:text-blue-600 transition-all">
                      <a.icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-foreground text-center">{a.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
