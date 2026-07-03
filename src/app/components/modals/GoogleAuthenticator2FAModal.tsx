"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Smartphone, QrCode, Check, Copy } from "lucide-react";
import { api } from "../../../lib/api";

export interface GoogleAuthenticator2FAModalProps {
  isOpen: boolean;
  user: { id: number; name: string; email: string; role: "ADMIN" | "USER" } | null;
  step: "prompt" | "setup" | "login_verify";
  onClose: () => void;
  onSuccess: (user: any) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}

export function GoogleAuthenticator2FAModal({
  isOpen,
  user,
  step: initialStep,
  onClose,
  onSuccess,
  showToast,
}: GoogleAuthenticator2FAModalProps) {
  const [step, setStep] = useState<"prompt" | "setup" | "login_verify">(initialStep);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setStep(initialStep);
    setCode("");
    setErrorMsg("");
  }, [initialStep, isOpen]);

  if (!isOpen || !user) return null;

  const userEmail = user.email || "user@example.com";
  const defaultSecret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
  const secretKey = (typeof window !== "undefined" ? localStorage.getItem(`electrohub_2fa_secret_${userEmail.toLowerCase()}`) : null) || defaultSecret;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=otpauth://totp/ElectroHub:${encodeURIComponent(userEmail)}?secret=${secretKey}&issuer=ElectroHub`;

  const handleCopySecret = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`electrohub_2fa_status_${userEmail.toLowerCase()}`, "skipped");
    }
    showToast("2FA setup skipped. You can enable 2FA anytime.", "info");
    onClose();
    onSuccess(user);
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMsg("Please enter a valid 6-digit code from your Google Authenticator app.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.verifyGoogleTotp(userEmail, cleanCode, secretKey);
      if (typeof window !== "undefined") {
        localStorage.setItem(`electrohub_2fa_status_${userEmail.toLowerCase()}`, "enabled");
        localStorage.setItem(`electrohub_2fa_secret_${userEmail.toLowerCase()}`, secretKey);
      }
      showToast("🎉 Google Authenticator 2FA activated successfully for your account!", "success");
      onClose();
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid Google Authenticator code. Fake codes are not allowed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMsg("Please enter a valid 6-digit code from your Google Authenticator app.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.verifyGoogleTotp(userEmail, cleanCode, secretKey);
      showToast(`2FA Verified! Welcome back, ${user.name}`, "success");
      onClose();
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid Google Authenticator code. Fake codes are not allowed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative">

        {/* STEP 1: PROMPT TO SETUP 2FA */}
        {step === "prompt" && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enable Google Authenticator 2FA?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Protect your account <strong className="text-foreground">({userEmail})</strong> with Two-Factor Authentication. Scan a barcode using Google Authenticator on your phone.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-2xl border border-border text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Smartphone size={15} className="text-blue-500" /> Google Authenticator Integration
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Each time you log in, Google Authenticator will generate a secure 6-digit code on your mobile phone for instant verification.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setStep("setup")}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <QrCode size={16} /> Okay / Scan Barcode
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground font-semibold text-xs rounded-xl transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCAN BARCODE & VERIFY INITIAL TOTP CODE */}
        {step === "setup" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Scan Barcode (Google Authenticator)</h3>
                  <p className="text-[11px] text-muted-foreground">Account: {userEmail}</p>
                </div>
              </div>
              <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground font-semibold">
                Skip
              </button>
            </div>

            {/* Barcode / QR Code */}
            <div className="bg-white p-4 rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm">
              <img src={qrCodeUrl} alt="Google Authenticator QR Code Barcode" className="w-44 h-44 object-contain rounded-lg" />
              <span className="text-[10px] text-slate-500 font-medium mt-2">Scan with Google Authenticator App</span>
            </div>

            {/* Secret Key Manual Entry */}
            <div className="bg-muted/50 p-3.5 rounded-xl border border-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Secret Key (Manual Entry)</span>
                <span className="text-xs font-mono font-bold text-foreground tracking-widest">{secretKey}</span>
              </div>
              <button
                type="button"
                onClick={handleCopySecret}
                className="px-2.5 py-1.5 bg-card hover:bg-accent text-xs font-bold rounded-lg text-foreground border border-border transition-colors flex items-center gap-1"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifySetup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Enter 6-Digit Code from Google Authenticator:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 482910"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-center text-lg font-mono tracking-widest text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 py-3 bg-muted hover:bg-accent font-bold text-xs text-foreground rounded-xl transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Verify & Enable 2FA"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: LOGIN 2FA VERIFICATION */}
        {step === "login_verify" && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Google Authenticator Verification</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open your <strong className="text-foreground">Google Authenticator</strong> app on your phone and enter the 6-digit verification code for <strong className="text-foreground">{userEmail}</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-center text-2xl font-mono tracking-[0.4em] text-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Verifying Code..." : "Verify Code & Sign In"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
