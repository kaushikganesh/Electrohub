"use client";

import { useState, useEffect } from "react";
import { User, Camera, Package, Settings, Trash2 } from "lucide-react";
import { Page, fmtPrice } from "../../types";
import { api } from "../../../lib/api";

export interface ProfilePageProps {
  currentUser: { id: number; name: string; email: string; role: "ADMIN" | "USER"; avatar?: string | null } | null;
  onNavigate: (p: Page, data?: any, targetAuthMode?: any) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  onLogout: () => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

export function ProfilePage({ currentUser, onNavigate, showToast, onLogout, onUpdateAvatar }: ProfilePageProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userOrders, setUserOrders] = useState([] as any[]);

  useEffect(() => {
    if (currentUser?.email) {
      const emailLower = currentUser.email.toLowerCase();
      const userId = currentUser.id;
      api.getOrders().then((res) => {
        if (res && Array.isArray(res)) {
          const filtered = res.filter(function(o: any) {
            return (
              (o.customerEmail && o.customerEmail.toLowerCase() === emailLower) ||
              (userId && o.userId === userId)
            );
          });
          setUserOrders(filtered);
        }
      });
    }
  }, [currentUser]);

  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount(undefined, currentUser?.email);
      showToast("Your profile and account have been permanently deleted.", "success");
      onLogout();
      onNavigate("auth", undefined, "register");
    } catch (err: any) {
      showToast(err.message || "Failed to delete profile.", "error");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      onNavigate("auth", undefined, "login");
    }
  }, [currentUser, onNavigate]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-muted/20 dark:bg-[#080D1A] pt-24 pb-16 flex items-center justify-center">
        <div className="text-center p-8 bg-card border border-border rounded-3xl max-w-md shadow-lg">
          <User size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-xs text-muted-foreground mb-6">Please sign in or create an account to view your user profile.</p>
          <button
            onClick={() => onNavigate("auth", undefined, "login")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const name = currentUser.name;
  const email = currentUser.email;
  const role = currentUser.role;

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-[#080D1A] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
            <div className="relative group flex-shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={name}
                  className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-blue-500/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {name[0].toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1.5 -right-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-110">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        showToast("Please choose an image under 5MB.", "error");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Str = reader.result as string;
                        if (onUpdateAvatar) onUpdateAvatar(base64Str);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold">Role: {role}</span>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">⭐ Gold Member</span>
                <label className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer underline underline-offset-2 flex items-center gap-1">
                  <Camera size={12} /> Upload / Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast("Please choose an image under 5MB.", "error");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64Str = reader.result as string;
                          if (onUpdateAvatar) onUpdateAvatar(base64Str);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="py-6 space-y-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Profile Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Full Name</p>
                <p className="text-foreground font-semibold text-sm mt-1">{name}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                <p className="text-foreground font-semibold text-sm mt-1">{email}</p>
              </div>
            </div>
          </div>

          {/* Purchased Products & Orders in Profile */}
          <div className="py-6 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package size={18} className="text-blue-600" /> My Purchased Products ({userOrders.length} Orders)
              </h2>
              <button
                onClick={() => onNavigate("orders")}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View All Orders {"→"}
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="p-4 bg-muted/30 rounded-2xl border border-border text-center text-xs text-muted-foreground">
                You have not purchased any products yet. Click Buy Now on any item to place an order.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userOrders.map((o) => (
                  <div key={o.id} className="bg-muted/40 p-4 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-500">{o.orderNumber || `#ORD-${o.id}`}</span>
                      <span className="text-xs font-bold text-foreground">{fmtPrice(o.totalAmount)}</span>
                    </div>
                    {o.items?.map((it: any, idx: number) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {"• "} <strong className="text-foreground">{it.productName}</strong> (Qty: {it.quantity})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onNavigate("settings")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <Settings size={15} /> Open Settings
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Trash2 size={15} /> Delete Profile
            </button>
          </div>
        </div>
      </div>

      {/* Deletion Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Delete Profile {"&"} Account</h3>
            <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
              This will permanently remove your account and all stored data. This action <strong className="text-red-500">cannot be undone</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-muted text-foreground font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
