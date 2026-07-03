const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

export interface UserAuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    avatar?: string | null;
  };
}

export const api = {
  // Products
  getProducts: async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    } catch (err) {
      console.warn("Failed fetching products from Express backend, returning fallback.", err);
      return null;
    }
  },

  createProduct: async (productData: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create product");
    }
    return await res.json();
  },

  deleteProduct: async (id: number) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return await res.json();
  },

  // Orders
  getOrders: async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    } catch (err) {
      console.warn("Failed fetching orders from backend:", err);
      return null;
    }
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to place order");
    }
    return await res.json();
  },

  // Auth
  login: async (email: string, password: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    return data;
  },

  register: async (name: string, email: string, password: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }
    return data;
  },

  verify2FA: async (email: string, code: string): Promise<UserAuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "2FA verification failed");
    }
    return data;
  },

  verifyGoogleTotp: async (email: string, code: string, secret?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/verify-google-totp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, secret }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid Google Authenticator code");
    }
    return data;
  },

  resend2FA: async (email: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/send-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to resend 2FA code");
    }
    return data;
  },

  googleAuth: async (name: string, email: string, avatar?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, avatar }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Google authentication failed");
    }
    return data;
  },

  verifyGoogleToken: async (idToken: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/google-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Google token verification failed");
    }
    return data;
  },

  updateAvatar: async (email: string, avatar: string): Promise<UserAuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/update-avatar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, avatar }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update profile photo");
    }
    return data;
  },

  resetPassword: async (email: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to reset password");
    }
    return data;
  },

  deleteAccount: async (token?: string, userEmail?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/auth/delete-account`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete account from PostgreSQL database");
    }
    return data;
  },

  // Admin Stats & Users
  getAdminStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return await res.json();
    } catch (err) {
      console.warn("Failed fetching admin stats from backend:", err);
      return null;
    }
  },

  getAdminUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch admin users");
      return await res.json();
    } catch (err) {
      console.warn("Failed fetching admin users from backend:", err);
      return null;
    }
  },

  deleteUserByAdmin: async (email: string) => {
    const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete user");
    }
    return data;
  },

  createUserByAdmin: async (userData: { name: string; email: string; password?: string; role?: "USER" | "ADMIN" }) => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create user");
    }
    return data;
  },
};
