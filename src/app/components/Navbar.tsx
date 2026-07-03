"use client";

import { useState, useEffect } from "react";
import {
  Zap, Search, Heart, Bell, ShoppingCart, Sun, Moon, User, ChevronDown,
  Grid, Settings, Package, BarChart2, LogOut, X, Menu, Mic, Camera, ArrowRight,
} from "lucide-react";
import { Page, CartItem, PRODUCTS, fmtPrice } from "../types";

export function Navbar({
  isDark, setIsDark, onNavigate, currentPage, cart, wishlist, currentUser, onLogout,
}: {
  isDark: boolean; setIsDark: (v: boolean) => void;
  onNavigate: (p: Page) => void; currentPage: Page;
  cart: CartItem[]; wishlist: number[];
  currentUser: { id: number; name: string; email: string; role: "ADMIN" | "USER"; avatar?: string | null } | null;
  onLogout: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const userInitial = currentUser?.name ? currentUser.name[0].toUpperCase() : "A";
  const userDisplayName = currentUser?.name ? currentUser.name.split(" ")[0] : "Account";

  const navLinks: Array<{ label: string; page: Page }> = [
    { label: "Home", page: "home" },
    { label: "Products", page: "product" },
    { label: "About", page: "contact" },
    { label: "Contact", page: "contact" },
    { label: "Help", page: "help" },
  ];

  const userEmail = currentUser?.email?.trim().toLowerCase();
  const [userNotifications, setUserNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && userEmail) {
      const key = `electrohub_user_notifications_${userEmail}`;
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
    } else {
      setUserNotifications([]);
    }
  }, [userEmail, notifOpen]);

  return (
    <>
      <header
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-2xl bg-white/80 dark:bg-[#0E1629]/80 border-b border-border shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={17} className="text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Electro<span className="text-blue-600">Hub</span>
              </span>
            </button>

            {/* Nav Links — desktop */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => onNavigate(l.page)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentPage === l.page
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => onNavigate("wishlist")}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Bell size={18} />
                  {userNotifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {userNotifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                      <span className="font-bold text-foreground text-sm">Notifications</span>
                      {userNotifications.length > 0 && (
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined" && userEmail) {
                              localStorage.removeItem(`electrohub_user_notifications_${userEmail}`);
                              setUserNotifications([]);
                            }
                          }}
                          className="text-xs text-red-500 hover:underline font-semibold"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {userNotifications.length === 0 ? (
                        <div className="py-8 px-4 text-center space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mx-auto mb-1">
                            <Bell size={20} />
                          </div>
                          <p className="text-xs font-bold text-foreground">No Notifications</p>
                          <p className="text-[11px] text-muted-foreground max-w-[210px] mx-auto leading-relaxed">
                            {currentUser
                              ? "You have no notifications right now. Order confirmations will appear here when you purchase products."
                              : "Sign in and purchase products to receive real order notifications."}
                          </p>
                        </div>
                      ) : (
                        userNotifications.map((n: any) => (
                          <div
                            key={n.id}
                            className="flex gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                              <Package size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground leading-snug">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/80 mt-1">{n.createdAt}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => onNavigate("cart")}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={userDisplayName}
                      className="w-7 h-7 rounded-full object-cover border border-blue-500/40 shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-foreground">{userDisplayName}</span>
                  <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50">
                    {[
                      { label: "My Dashboard", icon: Grid, page: "dashboard" as Page },
                      { label: "Profile", icon: User, page: "profile" as Page },
                      { label: "Settings", icon: Settings, page: "settings" as Page },
                      { label: "My Orders", icon: Package, page: "orders" as Page },
                      { label: "Wishlist", icon: Heart, page: "wishlist" as Page },
                      { label: "Admin Panel", icon: BarChart2, page: "admin" as Page },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { onNavigate(item.page); setUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <item.icon size={15} /> {item.label}
                      </button>
                    ))}
                    <div className="border-t border-border">
                      {currentUser ? (
                        <button
                          onClick={() => { onLogout(); onNavigate("auth"); setUserOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      ) : (
                        <button
                          onClick={() => { onNavigate("auth"); setUserOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors font-bold"
                        >
                          <User size={15} /> Sign In / Register
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-card border-t border-border px-4 py-3 space-y-0.5">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => { onNavigate(l.page); setMobileOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-28 px-4">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search size={19} className="text-muted-foreground flex-shrink-0" />
              <input
                autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"><Mic size={13} /></button>
                <button className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"><Camera size={13} /></button>
                <button onClick={() => setSearchOpen(false)} className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"><X size={13} /></button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Trending</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["MacBook Air M4", "iPhone 16 Pro", "Sony Headphones", "Samsung TV", "AirPods Pro"].map((t) => (
                  <button key={t} onClick={() => setSearchQ(t)} className="px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{t}</button>
                ))}
              </div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Results</p>
              {PRODUCTS.filter((p) => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-muted flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand} · {fmtPrice(p.price)}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
