"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Trash2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("electrohub_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
          router.push("/?auth=login");
        }
      } else {
        router.push("/?auth=login");
      }
    }
  }, [router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount(undefined, user?.email);
      if (typeof window !== "undefined") {
        localStorage.removeItem("electrohub_user");
      }
      router.push("/?auth=register");
    } catch (err: any) {
      alert(err.message || "Failed to delete account from PostgreSQL database");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-900/30 text-blue-400 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Account Settings</h1>
            <p className="text-xs text-gray-400">Manage account & privacy options</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertCircle size={16} /> Danger Zone
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Permanently erase your profile, saved orders, and account data directly from PostgreSQL. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={15} /> Delete Profile (PostgreSQL)
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-900/30 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete Profile from PostgreSQL?</h3>
            <p className="text-xs text-gray-400 mb-6">
              Are you sure you want to delete your profile from PostgreSQL? All associated data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
