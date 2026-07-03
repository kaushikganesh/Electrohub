"use client";

import { useState, useEffect } from "react";
import { Settings, User, ShieldCheck, QrCode, AlertCircle, Trash2 } from "lucide-react";
import { Page } from "../../types";
import { api } from "../../../lib/api";

export interface SettingsPageProps {
  currentUser: { id: number; name: string; email: string; role: "ADMIN" | "USER" } | null;
  onNavigate: (p: Page, data?: any, targetAuthMode?: any) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  onLogout: () => void;
  onEnable2FA?: () => void;
}

export function SettingsPage({ currentUser, onNavigate, showToast, onLogout, onEnable2FA }: SettingsPageProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emailLower = currentUser?.email?.toLowerCase() || "";
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    if (typeof window !== "undefined" && emailLower) {
      return localStorage.getItem(`electrohub_2fa_status_${emailLower}`) === "enabled";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && emailLower) {
      const status = localStorage.getItem(`electrohub_2fa_status_${emailLower}`);
      setIs2FAEnabled(status === "enabled");
    }
  }, [emailLower]);

  const handleToggle2FAInSettings = () => {
    if (is2FAEnabled) {
      if (typeof window !== "undefined" && emailLower) {
        localStorage.setItem(`electrohub_2fa_status_${emailLower}`, "skipped");
      }
      setIs2FAEnabled(false);
      showToast("2FA disabled for your account.", "info");
    } else if (onEnable2FA) {
      onEnable2FA();
    }
  };

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

  if (!currentUser) return null;

  const name = currentUser.name;
  const email = currentUser.email;

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-[#080D1A] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage profile, account preferences and privacy</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" /> Account Overview
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/40 p-4 rounded-2xl border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Full Name</p>
              <p className="text-foreground font-bold text-sm mt-0.5">{name}</p>
            </div>
            <div className="bg-muted/40 p-4 rounded-2xl border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
              <p className="text-foreground font-bold text-sm mt-0.5">{email}</p>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication (2FA) Security */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={19} className="text-blue-600" />
                <h2 className="text-base font-bold text-foreground">Google Authenticator 2FA</h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${is2FAEnabled ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                  {is2FAEnabled ? "Active & Enabled" : "Disabled / Skipped"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                {is2FAEnabled
                  ? "Your account is secured with Google Authenticator 2FA. You will be prompted for your live 6-digit TOTP code when logging in."
                  : "Protect your account with Two-Factor Authentication. If you skipped setup previously, you can enable Google Authenticator 2FA anytime."}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {is2FAEnabled ? (
                <div className="flex gap-2">
                  <button
                    onClick={onEnable2FA}
                    className="px-3.5 py-2.5 bg-muted hover:bg-accent text-foreground font-bold text-xs rounded-xl transition-all border border-border flex items-center gap-1.5"
                  >
                    <QrCode size={14} /> Re-scan QR
                  </button>
                  <button
                    onClick={handleToggle2FAInSettings}
                    className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white font-bold text-xs rounded-xl transition-all border border-red-500/20"
                  >
                    Disable 2FA
                  </button>
                </div>
              ) : (
                <button
                  onClick={onEnable2FA}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <QrCode size={16} /> Enable 2FA Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone: Delete Profile Option */}
        <div className="bg-red-500/5 border border-red-500/30 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={18} /> Delete Account {"&"} Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Permanently erase your user profile, active orders, saved payment methods, and account settings. This action is irreversible.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <Trash2 size={16} /> Delete My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Delete Profile</h3>
            <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
              Are you sure you want to delete your profile? All associated profile data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
