"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Trash2, LogOut, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("electrohub_user");
    }
    setUser(null);
    router.push("/?auth=login");
  };

  const handleDelete = async () => {
    if (!user?.email) return;
    setDeleting(true);
    try {
      await api.deleteAccount(undefined, user.email);
      if (typeof window !== "undefined") {
        localStorage.removeItem("electrohub_user");
      }
      setUser(null);
      router.push("/?auth=register");
    } catch (err: any) {
      alert(err.message || "Failed to delete account from PostgreSQL database");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-3xl max-w-sm">
          <p className="text-sm text-gray-400 mb-4">Please sign in to view your profile.</p>
          <button
            onClick={() => router.push("/?auth=login")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const name = user.name;
  const email = user.email;
  const role = user.role;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
            {name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-xs text-gray-400">{email}</p>
            <span className="inline-block mt-1 text-[10px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full font-bold">
              Role: {role}
            </span>
          </div>
        </div>

        <div className="py-6 space-y-3">
          <button
            onClick={() => router.push("/settings")}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Settings size={15} /> Go to Settings
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 size={15} /> Delete Profile (PostgreSQL)
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={15} /> Sign Out
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
              This action will permanently remove your user profile and all records from PostgreSQL database.
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
