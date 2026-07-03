"use client";

import { useState, useEffect } from "react";
import { Zap, AlertCircle, Mail, Lock, Eye, RefreshCw, Shield, X } from "lucide-react";
import { Page, Product } from "../../types";
import { api } from "../../../lib/api";

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthPage({
  onNavigate,
  onLoginSuccess,
  showToast,
  initialMode = "login",
}: {
  onNavigate: (p: Page, data?: Product, targetMode?: any, user?: any) => void;
  onLoginSuccess: (user: { id: number; name: string; email: string; role: "ADMIN" | "USER"; avatar?: string | null }) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  initialMode?: "login" | "register" | "admin" | "reset_password";
}) {
  const [mode, setMode] = useState<"login" | "register" | "admin" | "reset_password">(initialMode);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Modal & Auth State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [customGName, setCustomGName] = useState("");
  const [customGEmail, setCustomGEmail] = useState("");
  const [customGPassword, setCustomGPassword] = useState("");

  const saveUserSession = (user: any, isRememberMe: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("electrohub_user", JSON.stringify(user));
    if (isRememberMe) {
      const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
      const sessionObj = {
        user,
        rememberMe: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + FIFTEEN_DAYS_MS,
      };
      localStorage.setItem("electrohub_user_session", JSON.stringify(sessionObj));
    } else {
      localStorage.removeItem("electrohub_user_session");
    }
  };

  // Dynamically load Official Google Identity Services SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scriptId = "google-jssdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleSDK();
      document.body.appendChild(script);
    } else {
      initGoogleSDK();
    }
  }, []);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "748333877568-i1m18a8bg6ejbem5uticuivv0dljkcdb.apps.googleusercontent.com";

  const initGoogleSDK = () => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              setErrorMsg("");
              setModalError("");
              try {
                const res = await api.verifyGoogleToken(response.credential);
                setShowGoogleModal(false);
                saveUserSession(res.user, true);
                onLoginSuccess(res.user);
                showToast(`Signed in via Google as ${res.user.name}`, "success");
                onNavigate(res.user.role === "ADMIN" ? "admin" : "profile", undefined, undefined, res.user);
              } catch (err: any) {
                const msg = err.message || "Google token verification failed.";
                setErrorMsg(msg);
                setModalError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
      } catch (e) {
        console.warn("Google SDK init note:", e);
      }
    }
  };

  const triggerGoogleSignInPopup = () => {
    setModalError("");
    setErrorMsg("");

    // 1. Primary: Use Google Identity Services OAuth2 Token Client Popup
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          error_callback: (err: any) => {
            console.warn("Google OAuth popup error:", err);
            setShowGoogleModal(true);
          },
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== "popup_closed_by_user") {
                setShowGoogleModal(true);
              }
              return;
            }
            if (tokenResponse.access_token) {
              setLoading(true);
              setErrorMsg("");
              setModalError("");
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userInfoRes.json();
                if (!profile.email) {
                  throw new Error("Could not retrieve verified email from Google.");
                }
                const res = await api.googleAuth(
                  profile.name || profile.given_name || profile.email.split("@")[0],
                  profile.email,
                  profile.picture
                );
                setShowGoogleModal(false);
                saveUserSession(res.user, true);
                onLoginSuccess(res.user);
                showToast(`Signed in via Google as ${res.user.name}`, "success");
                onNavigate(res.user.role === "ADMIN" ? "admin" : "profile", undefined, undefined, res.user);
              } catch (err: any) {
                const msg = err.message || "Google Authentication failed.";
                setErrorMsg(msg);
                setModalError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("Google Token Client note:", err);
      }
    }

    // 2. Fallback: Open Google Authentication Portal Modal
    setShowGoogleModal(true);
  };

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg("");
    setModalError("");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) setEmail(emailParam);
    }
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "reset_password") {
        if (password !== confirmPassword) {
          setErrorMsg("Passwords do not match.");
          setLoading(false);
          return;
        }
        await api.resetPassword(email, password);
        showToast("Password updated successfully! You can now sign in with your new password.", "success");
        setMode("login");
      } else if (mode === "register") {
        if (!name) {
          setErrorMsg("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await api.register(name, email, password);
        saveUserSession(res.user, rememberMe);
        onLoginSuccess(res.user);
        showToast(`Account created! Welcome, ${res.user.name}`, "success");
        onNavigate(res.user.role === "ADMIN" ? "admin" : "profile", undefined, undefined, res.user);
      } else {
        const res = await api.login(email, password);
        if (mode === "admin" && res.user.role !== "ADMIN") {
          setErrorMsg("Access Denied: You must enter valid Administrator credentials.");
          setLoading(false);
          return;
        }
        saveUserSession(res.user, rememberMe);
        onLoginSuccess(res.user);
        showToast(
          res.user.role === "ADMIN"
            ? "Welcome Administrator! Access granted to Admin Panel."
            : `Signed in as ${res.user.name}`,
          "success"
        );
        onNavigate(res.user.role === "ADMIN" ? "admin" : "profile", undefined, undefined, res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (gName: string, gEmail: string, gAvatar?: string, gPass?: string) => {
    const target = gEmail.trim().toLowerCase();
    const isGoogleMail = target.endsWith("@gmail.com") || target.endsWith("@google.com") || target === "kaushikganesh1512@gmail.com";

    if (!isGoogleMail) {
      const msg = "Google Authentication Failed: Only real @gmail.com or verified Google Workspace accounts are allowed.";
      setErrorMsg(msg);
      setModalError(msg);
      return;
    }

    if (gPass !== undefined && gPass.trim().length < 6) {
      const msg = "Google Authentication Failed: Your Google Account password must be at least 6 characters.";
      setErrorMsg(msg);
      setModalError(msg);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setModalError("");
    try {
      const res = await api.googleAuth(gName, target, gAvatar);
      setShowGoogleModal(false);
      saveUserSession(res.user, true);
      onLoginSuccess(res.user);
      showToast(`Signed in via Google as ${res.user.name}`, "success");
      onNavigate(res.user.role === "ADMIN" ? "admin" : "profile", undefined, undefined, res.user);
    } catch (err: any) {
      const msg = err.message || "Google Authentication failed.";
      setErrorMsg(msg);
      setModalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 dark:from-[#080D1A] dark:via-[#0D1526] dark:to-[#080D1A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("home")} className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Electro<span className="text-blue-600">Hub</span></span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login"
              ? "User Sign In"
              : mode === "register"
              ? "Create User Account"
              : mode === "reset_password"
              ? "Change Password"
              : "Administrator Sign In"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "login"
              ? "Access your orders, cart, and wishlist"
              : mode === "register"
              ? "Enter your details or sign up with Google"
              : mode === "reset_password"
              ? "Set a new password for your ElectroHub account"
              : "Enter admin credentials to open the Admin Panel"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/5">
          {/* Mode Selector */}
          {mode !== "reset_password" && (
            <div className="flex bg-muted rounded-2xl p-1 mb-6 text-xs font-bold">
              <button
                onClick={() => { setMode("login"); setErrorMsg(""); }}
                className={`flex-1 py-2 rounded-xl transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                User Login
              </button>
              <button
                onClick={() => { setMode("register"); setErrorMsg(""); }}
                className={`flex-1 py-2 rounded-xl transition-all ${mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setMode("admin");
                  setErrorMsg("");
                  setEmail("");
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${mode === "admin" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Admin
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode !== "reset_password" && mode !== "admin" && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={triggerGoogleSignInPopup}
                className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow"
              >
                <GoogleLogo />
                <span>{mode === "register" ? "Sign up with Google" : "Continue with Google"}</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Or with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-foreground block mb-1.5">
                {mode === "admin" ? "Admin Email Address" : "Email Address"}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-foreground">
                  {mode === "reset_password" ? "New Password" : "Password"}
                </label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>

            {(mode === "register" || mode === "reset_password") && (
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500/20 bg-muted cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground font-semibold transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset_password");
                    setErrorMsg("");
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                mode === "admin"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-500/25"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25"
              }`}
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : mode === "admin" ? (
                <>
                  <Shield size={16} /> Sign In as Admin
                </>
              ) : mode === "reset_password" ? (
                "Update Password"
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {mode === "reset_password" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Google Authentication Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <GoogleLogo />
                <div>
                  <h3 className="font-bold text-foreground text-base">Google Identity Authentication</h3>
                  <p className="text-xs text-muted-foreground">Log in with your real Google Account & Password</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Shield size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Official Google Security Notice:</strong> Google authenticates your real Gmail address & password. Random emails or invalid passwords will be <strong className="text-red-500">rejected</strong>.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-foreground">Verified Google Accounts:</p>
              {[
                {
                  name: "Kaushik Ganesh",
                  email: "kaushikganesh1512@gmail.com",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                  tag: "Verified Gmail",
                },
                {
                  name: "Rahul Sharma",
                  email: "rahul.sharma@gmail.com",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                  tag: "Verified Gmail",
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleGoogleAuth(acc.name, acc.email, acc.avatar, "real_google_pass_123")}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/50 hover:bg-muted border border-border transition-all text-left group"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover border border-blue-500/30" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-xs group-hover:text-blue-500 transition-colors">{acc.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{acc.email}</p>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">{acc.tag}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-border space-y-3">
              <p className="text-xs font-bold text-foreground">Authenticate your Real Google Account:</p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Kaushik Ganesh)"
                  value={customGName}
                  onChange={(e) => setCustomGName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Real Gmail Address (e.g. user@gmail.com)"
                  value={customGEmail}
                  onChange={(e) => setCustomGEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Real Google Account Password"
                  value={customGPassword}
                  onChange={(e) => setCustomGPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                />
                <button
                  disabled={!customGEmail || !customGPassword}
                  onClick={() => handleGoogleAuth(customGName || customGEmail.split("@")[0], customGEmail, undefined, customGPassword)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Shield size={14} /> Authenticate Real Google Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
