"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Page, Product, CartItem, ToastItem, PRODUCTS, fmtPrice, addUserNotification } from "./types";

// Reusable Components & Modals
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeaturedProducts, WhyChoose } from "./components/ProductGrid";
import { AIRecommendations, Newsletter, Footer } from "./components/Footer";
import { Toasts } from "./components/Toasts";
import { GoogleAuthenticator2FAModal } from "./components/modals/GoogleAuthenticator2FAModal";

// Page Views
import { IntroPage } from "./components/pages/IntroPage";
import { AuthPage } from "./components/pages/AuthPage";
import { ProductDetailPage } from "./components/pages/ProductDetailPage";
import { CartPage } from "./components/pages/CartPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { AdminPage } from "./components/pages/AdminPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import { WishlistPage } from "./components/pages/WishlistPage";
import { HelpPage } from "./components/pages/HelpPage";
import { ContactPage } from "./components/pages/ContactPage";

function HomePage({
  products, onNavigate, onAddToCart, onToggleWishlist, wishlist, showToast,
}: {
  products: Product[]; onNavigate: (p: Page, d?: Product) => void;
  onAddToCart: (p: Product) => void; onToggleWishlist: (id: number) => void;
  wishlist: number[]; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <FeaturedProducts
        products={products} onNavigate={onNavigate} onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist} wishlist={wishlist} showToast={showToast}
      />
      <WhyChoose />
      <AIRecommendations products={products} onNavigate={onNavigate} onAddToCart={onAddToCart} showToast={showToast} />
      <Newsletter />
      <Footer onNavigate={onNavigate} />
    </>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("electrohub_theme");
      if (savedTheme) return savedTheme === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("electrohub_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("electrohub_theme", "light");
      }
    }
  }, [isDark]);

  const [page, setPage] = useState("intro" as Page);
  const [products, setProducts] = useState(PRODUCTS as Product[]);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0] as Product);
  const [cart, setCart] = useState([] as CartItem[]);
  const [wishlist, setWishlist] = useState([] as number[]);
  const [toasts, setToasts] = useState([] as ToastItem[]);
  const [currentUser, setCurrentUser] = useState(null as any);
  const [authMode, setAuthMode] = useState<"login" | "register" | "admin" | "reset_password">("login");
  const [userPurchasedOrders, setUserPurchasedOrders] = useState([] as any[]);
  const [twoFactorModal, setTwoFactorModal] = useState<{
    open: boolean;
    user: any;
    step: "prompt" | "setup" | "login_verify";
  }>({ open: false, user: null, step: "prompt" });

  const handleLoginWith2FA = (user: any) => {
    if (!user || !user.email) return;
    const userEmailLower = user.email.toLowerCase();
    const status = typeof window !== "undefined" ? localStorage.getItem(`electrohub_2fa_status_${userEmailLower}`) : null;

    if (status === "enabled") {
      setTwoFactorModal({ open: true, user, step: "login_verify" });
    } else if (status === "skipped") {
      setCurrentUser(user);
      navigate("profile", undefined, undefined, user);
    } else {
      setTwoFactorModal({ open: true, user, step: "prompt" });
    }
  };

  // Load saved session user or force website intro page on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionData = localStorage.getItem("electrohub_user_session");
      const savedUser = localStorage.getItem("electrohub_user");
      let userToRestore: any = null;

      if (sessionData) {
        try {
          const parsedSession = JSON.parse(sessionData);
          const now = Date.now();
          if (parsedSession && parsedSession.expiresAt && now < parsedSession.expiresAt && parsedSession.user) {
            userToRestore = parsedSession.user;
          } else {
            localStorage.removeItem("electrohub_user_session");
            localStorage.removeItem("electrohub_user");
          }
        } catch {
          localStorage.removeItem("electrohub_user_session");
        }
      }

      if (!userToRestore && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            userToRestore = parsed;
          }
        } catch {
          localStorage.removeItem("electrohub_user");
        }
      }

      if (userToRestore) {
        setCurrentUser(userToRestore);
        setPage("profile");
      } else {
        setPage("intro");
        setAuthMode("login");
      }

      const params = new URLSearchParams(window.location.search);
      const actionParam = params.get("action") || params.get("mode");
      if (actionParam === "reset-password" || actionParam === "reset_password" || actionParam === "reset") {
        setAuthMode("reset_password");
        setPage("auth");
      } else if (params.get("auth") === "register" || params.get("mode") === "register") {
        setAuthMode("register");
        setPage("auth");
      } else if (params.get("auth") === "login") {
        setAuthMode("login");
        setPage("auth");
      }
    }
    (async () => {
      let customProds: Product[] = [];
      let removedIds: number[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("electrohub_custom_products");
        const removed = localStorage.getItem("electrohub_removed_product_ids");
        if (stored) {
          try { customProds = JSON.parse(stored); } catch {}
        }
        if (removed) {
          try { removedIds = JSON.parse(removed); } catch {}
        }
      }
      const data = await api.getProducts();
      const combinedMap = new Map<number, Product>();

      // 1. Always include base catalog products
      PRODUCTS.forEach((p) => combinedMap.set(p.id, p));

      // 2. Merge backend products
      if (data && Array.isArray(data) && data.length > 0) {
        data.forEach((p: Product) => combinedMap.set(p.id, p));
      }

      // 3. Merge custom products added by Admin
      if (customProds.length > 0) {
        customProds.forEach((p) => combinedMap.set(p.id, p));
      }

      let combined = Array.from(combinedMap.values());

      // 4. Exclude products explicitly deleted by Admin
      if (removedIds.length > 0) {
        combined = combined.filter((p) => !removedIds.includes(p.id));
      }

      setProducts(combined);
      if (combined.length > 0) setSelectedProduct(combined[0]);
    })();
  }, []);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("electrohub_user");
      localStorage.removeItem("electrohub_user_session");
    }
    setCurrentUser(null);
    setAuthMode("login");
    setPage("intro");
    showToast("Signed out successfully.", "info");
  };

  const navigate = (
    p: Page,
    data?: Product,
    targetAuthMode: "login" | "register" | "admin" | "reset_password" = "login",
    authenticatedUser?: { id: number; name: string; email: string; role: "ADMIN" | "USER"; avatar?: string | null } | null
  ) => {
    const activeUser = authenticatedUser !== undefined ? authenticatedUser : currentUser;
    const protectedPages: Page[] = ["profile", "dashboard", "settings", "orders"];
    if (!activeUser && protectedPages.includes(p)) {
      showToast("Please sign in or register to access your account profile.", "info");
      setAuthMode("login");
      setPage("auth");
      return;
    }
    if (p === "admin" && activeUser?.role !== "ADMIN") {
      showToast("Admin authentication required. Please sign in with Admin credentials.", "error");
      setAuthMode("admin");
      setPage("auth");
      return;
    }
    if (p === "auth") {
      setAuthMode(targetAuthMode);
    }
    if (p === "product" && data) setSelectedProduct(data);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === product.id);
      if (ex) return c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...product, qty: 1 }];
    });
  };

  const toggleWishlist = (id: number) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const updateCartQty = (id: number, qty: number) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeFromCart = (id: number) => setCart((c) => c.filter((i) => i.id !== id));
  const handleUpdateAvatar = async (avatarUrl: string) => {
    if (!currentUser?.email) {
      showToast("Please sign in to update your profile photo.", "error");
      return;
    }
    try {
      const res = await api.updateAvatar(currentUser.email, avatarUrl);
      if (res && res.user) {
        setCurrentUser((prev: any) => ({ ...prev, avatar: res.user.avatar || avatarUrl }));
        showToast("Profile photo updated & saved in PostgreSQL!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update profile photo.", "error");
    }
  };

  return (
    <div className="" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif" }}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Announcement bar */}
        {page !== "auth" && page !== "intro" && (
          <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 text-white text-xs text-center py-2 px-4">
            🎉 Free delivery on orders above ₹999 &nbsp;·&nbsp; Use code{" "}
            <strong className="font-black">ELECTRO10</strong> for 10% off your first order!{" "}
            <button onClick={() => navigate("product")} className="underline underline-offset-2 opacity-90 hover:opacity-100 ml-1 font-semibold">Shop Now {"→"}</button>
          </div>
        )}

        {page !== "auth" && page !== "intro" && (
          <Navbar
            isDark={isDark} setIsDark={setIsDark} onNavigate={navigate}
            currentPage={page} cart={cart} wishlist={wishlist}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        <div className={page !== "auth" && page !== "intro" ? "pt-8" : ""}>
          {page === "intro" && (
            <IntroPage
              onProceedToLogin={(targetMode = "login") => {
                setAuthMode(targetMode);
                setPage("auth");
              }}
            />
          )}
          {page === "home" && (
            <HomePage
              products={products} onNavigate={navigate} onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist} wishlist={wishlist} showToast={showToast}
            />
          )}
          {page === "product" && (
            <ProductDetailPage
              product={selectedProduct} onNavigate={navigate} onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist} wishlist={wishlist} showToast={showToast}
            />
          )}
          {page === "auth" && (
            <AuthPage
              onNavigate={navigate}
              onLoginSuccess={(user) => handleLoginWith2FA(user)}
              showToast={showToast}
              initialMode={authMode}
            />
          )}
          {page === "dashboard" && (
            <DashboardPage
              currentUser={currentUser}
              onNavigate={navigate}
              cart={cart}
              wishlist={wishlist}
              onLogout={handleLogout}
              userPurchasedOrders={userPurchasedOrders}
            />
          )}
          {page === "cart" && (
            <CartPage cart={cart} onUpdateQty={updateCartQty} onRemove={removeFromCart} onNavigate={navigate} showToast={showToast} />
          )}
          {page === "checkout" && (
            <CheckoutPage
              cart={cart}
              onNavigate={navigate}
              showToast={showToast}
              currentUser={currentUser}
              onOrderPlaced={(cartItems, newOrder) => {
                if (newOrder) {
                  setUserPurchasedOrders((prev) => [newOrder, ...prev]);
                  if (currentUser?.email) {
                    addUserNotification(
                      currentUser.email,
                      "Order Placed Successfully! 🎉",
                      `Order #${newOrder.id} for ${fmtPrice(newOrder.totalAmount)} was placed and is being processed.`,
                      "order"
                    );
                  }
                }
                setProducts((prev) =>
                  prev.map((p) => {
                    const item = cartItems.find((c) => c.id === p.id);
                    if (item) {
                      const currentStock = p.stock ?? 50;
                      const newStock = Math.max(0, currentStock - item.qty);
                      return { ...p, stock: newStock, inStock: newStock > 0 };
                    }
                    return p;
                  })
                );
                setCart([]);
              }}
            />
          )}
          {page === "wishlist" && (
            <WishlistPage wishlist={wishlist} onNavigate={navigate} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} showToast={showToast} />
          )}
          {page === "orders" && <OrdersPage currentUser={currentUser} userPurchasedOrders={userPurchasedOrders} onNavigate={navigate} />}
          {page === "admin" && (
            <AdminPage
              products={products}
              onNavigate={navigate}
              onUpdateStock={(id, newStock) => {
                setProducts((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, stock: newStock, inStock: newStock > 0 } : p))
                );
                showToast("Product stock count updated!", "success");
              }}
              onAddProduct={(newProd) => {
                setProducts((prev) => {
                  const updated = [newProd, ...prev];
                  if (typeof window !== "undefined") {
                    const customProds = updated.filter((p) => p.id > 1000 || !PRODUCTS.some((b) => b.id === p.id));
                    localStorage.setItem("electrohub_custom_products", JSON.stringify(customProds));
                  }
                  return updated;
                });
              }}
              onRemoveProduct={(productId) => {
                setProducts((prev) => {
                  const updated = prev.filter((p) => p.id !== productId);
                  if (typeof window !== "undefined") {
                    const removedIds: number[] = JSON.parse(localStorage.getItem("electrohub_removed_product_ids") || "[]");
                    if (!removedIds.includes(productId)) {
                      removedIds.push(productId);
                      localStorage.setItem("electrohub_removed_product_ids", JSON.stringify(removedIds));
                    }
                    const customProds = updated.filter((p) => p.id > 1000 || !PRODUCTS.some((b) => b.id === p.id));
                    localStorage.setItem("electrohub_custom_products", JSON.stringify(customProds));
                  }
                  return updated;
                });
              }}
              showToast={showToast}
            />
          )}
          {page === "help" && <HelpPage />}
          {page === "contact" && <ContactPage />}
          {page === "profile" && (
            <ProfilePage
              currentUser={currentUser}
              onNavigate={navigate}
              showToast={showToast}
              onLogout={handleLogout}
              onUpdateAvatar={handleUpdateAvatar}
            />
          )}
          {page === "settings" && (
            <SettingsPage
              currentUser={currentUser}
              onNavigate={navigate}
              showToast={showToast}
              onLogout={handleLogout}
              onEnable2FA={() => setTwoFactorModal({ open: true, user: currentUser, step: "setup" })}
            />
          )}
        </div>

        <GoogleAuthenticator2FAModal
          isOpen={twoFactorModal.open}
          user={twoFactorModal.user}
          step={twoFactorModal.step}
          onClose={() => setTwoFactorModal((prev) => ({ ...prev, open: false }))}
          onSuccess={(u) => {
            setCurrentUser(u);
            if (page !== "settings") {
              navigate("profile", undefined, undefined, u);
            }
          }}
          showToast={showToast}
        />

        <Toasts toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      </div>
    </div>
  );
}
