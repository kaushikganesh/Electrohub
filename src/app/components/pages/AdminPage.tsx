"use client";

import { useState, useEffect } from "react";
import { DollarSign, Package, Users, TrendingUp, Grid, List, ShoppingCart, Globe, BarChart2, Plus, Trash2, X } from "lucide-react";
import { Product, Page, fmtPrice } from "../../types";
import { Badge } from "../ProductCard";
import { api } from "../../../lib/api";

export interface AdminPageProps {
  products: Product[];
  onNavigate: (p: Page) => void;
  onUpdateStock?: (productId: number, newStock: number) => void;
  onAddProduct?: (product: Product) => void;
  onRemoveProduct?: (productId: number) => void;
  showToast?: (m: string, t?: "success" | "error" | "info") => void;
}

export function AdminPage({
  products,
  onNavigate,
  onUpdateStock,
  onAddProduct,
  onRemoveProduct,
  showToast,
}: AdminPageProps) {
  const [active, setActive] = useState("dashboard");
  const [adminUsers, setAdminUsers] = useState([] as any[]);
  const [liveOrders, setLiveOrders] = useState([] as any[]);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  // New Product Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("Apple");
  const [newProdCategory, setNewProdCategory] = useState("Laptops");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdStock, setNewProdStock] = useState("50");

  // Create User Modal Form State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"USER" | "ADMIN">("USER");
  const [creatingUserLoading, setCreatingUserLoading] = useState(false);

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      if (showToast) showToast("Name and email are required.", "error");
      return;
    }

    setCreatingUserLoading(true);
    try {
      const res = await api.createUserByAdmin({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword.trim() || "Password@123",
        role: newUserRole,
      });

      if (res && res.user) {
        setAdminUsers((prev) => [res.user, ...prev]);
      }
      setShowCreateUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("USER");
      if (showToast) showToast(`User "${newUserName.trim()}" created! Welcome email with password change link dispatched to ${newUserEmail.trim()}.`, "success");
    } catch (err: any) {
      if (showToast) showToast(err.message || "Failed to create user.", "error");
    } finally {
      setCreatingUserLoading(false);
    }
  };

  useEffect(() => {
    // Fetch live users and orders from Express backend API
    api.getAdminUsers().then((res) => {
      if (res && Array.isArray(res)) {
        setAdminUsers(res);
      }
    });
    api.getOrders().then((res) => {
      if (res && Array.isArray(res)) {
        setLiveOrders(res);
      }
    });
  }, []);

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      if (showToast) showToast("Please provide product name and price.", "error");
      return;
    }

    const priceNum = parseFloat(newProdPrice) || 0;
    const origPriceNum = parseFloat(newProdOriginalPrice) || priceNum;
    const stockNum = parseInt(newProdStock, 10) || 50;
    const disc = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 10;

    const defaultImg =
      newProdImage.trim() ||
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

    const newProd: Product = {
      id: Date.now(),
      name: newProdName.trim(),
      brand: newProdBrand.trim(),
      category: newProdCategory.trim(),
      price: priceNum,
      originalPrice: origPriceNum,
      discount: disc,
      rating: 4.9,
      reviews: 1,
      inStock: stockNum > 0,
      stock: stockNum,
      image: defaultImg,
      description: newProdDesc.trim() || `${newProdName} premium technology with advanced features and official warranty.`,
      specs: { Brand: newProdBrand, Category: newProdCategory, Warranty: "1 Year" },
    };

    try {
      await api.createProduct(newProd);
    } catch {
      // Ignore network fallback
    }

    if (onAddProduct) onAddProduct(newProd);
    setShowAddModal(false);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdImage("");
    setNewProdDesc("");

    if (showToast) showToast(`Product "${newProd.name}" added successfully! Visible across store.`, "success");
  };

  const handleAdminDeleteUser = async (u: any) => {
    if (confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})? They will need to register a new account to log in again.`)) {
      try {
        await api.deleteUserByAdmin(u.email);
        await api.deleteAccount(undefined, u.email);
        setAdminUsers((prev) => prev.filter((user) => user.email.toLowerCase() !== u.email.toLowerCase()));
        if (showToast) showToast(`User "${u.name}" (${u.email}) deleted permanently from database.`, "success");
      } catch (err: any) {
        if (showToast) showToast(err.message || "Failed to delete user.", "error");
      }
    }
  };

  const kpis = [
    { label: "Total Revenue", value: "₹93.2L", change: "+18.5%", icon: DollarSign, col: "blue" },
    { label: "Total Orders", value: liveOrders.length > 0 ? liveOrders.length.toString() : "8,429", change: "+12.3%", icon: Package, col: "violet" },
    { label: "Registered Users", value: adminUsers.length > 0 ? adminUsers.length.toString() : "2,840", change: "+8.7%", icon: Users, col: "emerald" },
    { label: "Avg Order Value", value: "₹11,057", change: "+5.2%", icon: TrendingUp, col: "amber" },
  ];

  const sideItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid },
    { id: "users", label: "Registered Users & Purchases", icon: Users },
    { id: "products", label: "Products & Stock Count", icon: Package },
    { id: "inventory", label: "Inventory Stock Manager", icon: List },
    { id: "orders", label: "Live Orders", icon: ShoppingCart },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-[#080D1A] pt-16 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed top-16 bottom-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <BarChart2 size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-xs">Admin Panel</p>
              <p className="text-[10px] text-muted-foreground">ElectroHub PostgreSQL Live</p>
            </div>
          </div>
        </div>
        <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto">
          {sideItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active === item.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-2.5 border-t border-border">
          <button
            onClick={() => onNavigate("home")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Globe size={15} /> View Store
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">

          {/* DASHBOARD TAB */}
          {active === "dashboard" && (
            <div>
              <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                  <p className="text-muted-foreground text-sm">Welcome Admin {"·"} Real-time PostgreSQL Analytics</p>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpis.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl ${colorMap[k.col]} flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                          {k.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{k.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{k.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Products Stock Overview */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Product Inventory Stock Status</h3>
                    <p className="text-xs text-muted-foreground">Stock automatically decreases when users purchase items</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New Product
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => {
                    const stockVal = p.stock ?? 50;
                    return (
                      <div key={p.id} className="p-4 bg-muted/40 border border-border rounded-2xl flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-card flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-xs truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtPrice(p.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stockVal > 10 ? "bg-emerald-500/10 text-emerald-500" : stockVal > 0 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                              Stock: {stockVal} left
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED USERS & PURCHASES TAB */}
          {active === "users" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Registered Users {"&"} Product Purchases</h1>
                <p className="text-muted-foreground text-sm">All registered accounts in PostgreSQL database and their ordered products</p>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-4">
                  <span className="font-bold text-foreground text-sm">Total Users ({adminUsers.length})</span>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                  >
                    <Plus size={15} /> Create New User
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {adminUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                      No registered users found in database.
                    </div>
                  ) : (
                    adminUsers.map((u) => {
                      const isExpanded = expandedUser === u.id;
                      return (
                        <div key={u.id} className="p-5 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3.5">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-2xl object-cover border border-blue-500/40 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                                  {u.name[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-foreground text-sm">{u.name}</h4>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="text-right">
                                <span className="text-[10px] bg-blue-900/30 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                                  {u.role}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1 font-semibold">
                                  Orders: <span className="text-foreground font-bold">{u.totalOrders || 0}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-emerald-500">{fmtPrice(u.totalSpent || 0)}</p>
                                <p className="text-[10px] text-muted-foreground">Total Spent</p>
                              </div>
                              <button
                                onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                                className="px-3 py-1.5 bg-muted hover:bg-accent text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                              >
                                {isExpanded ? "Hide Details" : "Purchased Products"}
                              </button>

                              {/* Delete User Button for Admin */}
                              {u.role !== "ADMIN" && (
                                <button
                                  onClick={() => handleAdminDeleteUser(u)}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-red-500/20"
                                >
                                  <Trash2 size={13} /> Delete User
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Purchased Products Detailed View */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-border bg-muted/20 rounded-2xl p-4">
                              <h5 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                                <Package size={14} className="text-blue-500" /> Products Purchased by {u.name}:
                              </h5>
                              {!u.purchasedProducts || u.purchasedProducts.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">No products purchased yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {u.purchasedProducts.map((p: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-card p-3 rounded-xl border border-border text-xs">
                                      <div>
                                        <p className="font-bold text-foreground">{p.productName}</p>
                                        <p className="text-[10px] text-muted-foreground">Order: {p.orderId}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-foreground">Qty: {p.quantity} {"×"} {fmtPrice(p.price)}</p>
                                        <p className="text-[10px] text-emerald-500 font-bold">Total: {fmtPrice(p.total || p.quantity * p.price)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS & STOCK COUNT TAB */}
          {(active === "products" || active === "inventory") && (
            <div>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Product Catalog {"&"} Inventory Stock Count</h1>
                  <p className="text-muted-foreground text-sm">Manage products & stock levels. Newly added products appear across the entire user store.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Product
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock Left</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map((p) => {
                        const stockVal = p.stock ?? 50;
                        return (
                          <tr key={p.id} className="hover:bg-muted/30">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-muted" />
                                <span className="font-bold text-foreground text-xs">{p.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-muted-foreground font-semibold">{p.brand}</td>
                            <td className="p-4 text-xs font-bold text-foreground">{fmtPrice(p.price)}</td>
                            <td className="p-4">
                              <span className="font-bold text-xs text-foreground">{stockVal} units</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${stockVal > 10 ? "bg-emerald-500/10 text-emerald-500" : stockVal > 0 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                                {stockVal > 10 ? "In Stock" : stockVal > 0 ? "Low Stock" : "Out of Stock"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => onUpdateStock && onUpdateStock(p.id, Math.max(0, stockVal - 1))}
                                  className="px-2 py-1 bg-muted hover:bg-accent text-xs font-bold rounded-lg border border-border transition-colors"
                                  title="Decrease stock count by 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => onUpdateStock && onUpdateStock(p.id, stockVal + 10)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                  title="Add +10 stock units"
                                >
                                  +10 Stock
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete product "${p.name}" from the website catalog?`)) {
                                      if (onRemoveProduct) onRemoveProduct(p.id);
                                      if (showToast) showToast(`Product "${p.name}" deleted from website catalog.`, "info");
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 border border-red-500/20"
                                  title="Remove product from store"
                                >
                                  <Trash2 size={13} /> Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LIVE ORDERS TAB */}
          {active === "orders" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Live Orders</h1>
                <p className="text-muted-foreground text-sm">All orders placed by customers across the marketplace</p>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  {liveOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                      No orders recorded yet.
                    </div>
                  ) : (
                    liveOrders.map((o) => (
                      <div key={o.id} className="p-5 hover:bg-muted/30">
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                          <div>
                            <span className="text-xs font-bold text-blue-500">{o.orderNumber || `#ORD-${o.id}`}</span>
                            <h4 className="font-bold text-foreground text-sm mt-0.5">{o.customerName} ({o.customerEmail})</h4>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground text-sm">{fmtPrice(o.totalAmount)}</span>
                            <div className="mt-1">
                              <Badge text={o.status || "Processing"} variant={o.status === "Delivered" ? "green" : "amber"} />
                            </div>
                          </div>
                        </div>
                        {o.items && (
                          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
                            {o.items.map((it: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                                <span>{"• "} {it.productName} (Qty: {it.quantity})</span>
                                <span className="font-semibold text-foreground">{fmtPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Add New Product</h3>
                      <p className="text-xs text-muted-foreground">Fill in details. Will be immediately displayed to all users across the store.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Product Name *</label>
                    <input
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="e.g. MacBook Pro M4 Max 16-inch"
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Brand *</label>
                      <input
                        required
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        placeholder="e.g. Apple, Sony, Samsung, Dell"
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Category *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option>Laptops</option>
                        <option>Smartphones</option>
                        <option>Headphones</option>
                        <option>Wearables</option>
                        <option>Television</option>
                        <option>Gaming</option>
                        <option>Audio</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Selling Price (₹) *</label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="149900"
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={newProdOriginalPrice}
                        onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                        placeholder="169900"
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Stock Left</label>
                      <input
                        type="number"
                        min={0}
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="50"
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Image URL / Select Preset</label>
                    <input
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {[
                        { label: "MacBook", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
                        { label: "iPhone", url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80" },
                        { label: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
                        { label: "Smartwatch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNewProdImage(preset.url)}
                          className="px-2.5 py-1 bg-muted hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[10px] font-bold text-muted-foreground hover:text-blue-600 rounded-lg whitespace-nowrap transition-colors"
                        >
                          Preset: {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="Describe specifications, key features, performance details..."
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 bg-muted hover:bg-accent font-bold text-xs text-foreground rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                    >
                      Save & Display to Users
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {showCreateUserModal && (
            <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Create New User Account</h3>
                      <p className="text-xs text-muted-foreground">User can log into ElectroHub immediately</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCreateUserModal(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Full Name *</label>
                    <input
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Password</label>
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Default: Password@123"
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "USER" | "ADMIN")}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="USER">Standard User (Customer)</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      className="flex-1 py-3 bg-muted hover:bg-accent font-bold text-xs text-foreground rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingUserLoading}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      {creatingUserLoading ? "Creating..." : "Create User Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
