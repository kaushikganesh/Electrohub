"use client";

import { CheckCircle, AlertCircle, Bell, X } from "lucide-react";
import { ToastItem } from "../types";

export function Toasts({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold border max-w-xs ${
            t.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : t.type === "error"
              ? "bg-red-600 text-white border-red-700"
              : "bg-card text-foreground border-border"
          }`}
        >
          {t.type === "success" ? <CheckCircle size={16} /> : t.type === "error" ? <AlertCircle size={16} /> : <Bell size={16} />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 transition-opacity ml-1"><X size={13} /></button>
        </div>
      ))}
    </div>
  );
}
