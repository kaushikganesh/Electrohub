export type Page =
  | "intro" | "home" | "product" | "auth" | "dashboard" | "cart"
  | "checkout" | "wishlist" | "orders" | "admin" | "help" | "contact"
  | "profile" | "settings";

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  inStock: boolean;
  stock?: number;
  description: string;
  specs?: Record<string, string>;
  category?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar?: string | null;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number | string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1, name: "MacBook Air M4", brand: "Apple", price: 129900, originalPrice: 149900,
    discount: 13, rating: 4.9, reviews: 2847, inStock: true, badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=480&fit=crop&auto=format",
    description: "Supercharged by the M4 chip with a 10-core CPU and 10-core GPU. Up to 18-hour battery life on a stunning 13.6-inch Liquid Retina display.",
    specs: { Chip: "Apple M4", CPU: "10-core", Memory: "16 GB unified", Storage: "256 GB SSD", Display: "13.6\" Liquid Retina", Battery: "18 hours", Weight: "1.24 kg" },
  },
  {
    id: 2, name: "Samsung Neo QLED 4K TV", brand: "Samsung", price: 189999, originalPrice: 239999,
    discount: 21, rating: 4.7, reviews: 1524, inStock: true, badge: "Hot Deal",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=480&fit=crop&auto=format",
    description: "65\" Neo QLED 4K with Quantum Matrix Technology and Neural Quantum Processor 4K. Deep blacks, vibrant colours, and Tizen Smart Hub.",
    specs: { Size: "65 inches", Resolution: "4K UHD", HDR: "HDR10+, HLG", "Refresh Rate": "120 Hz", Audio: "60 W 4.2ch", OS: "Tizen", HDMI: "4 × HDMI 2.1" },
  },
  {
    id: 3, name: "LG French Door Refrigerator", brand: "LG", price: 89999, originalPrice: 104999,
    discount: 14, rating: 4.6, reviews: 876, inStock: true,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=480&fit=crop&auto=format",
    description: "26 cu ft InstaView door-in-door refrigerator with craft ice maker, Door Cooling+, and LG ThinQ AI smart diagnosis.",
    specs: { Capacity: "26 cu ft", Type: "French Door", Stars: "5 Star", "Ice Maker": "Craft Ice", Smart: "LG ThinQ AI", Cooling: "Door Cooling+", Warranty: "10 yr compressor" },
  },
  {
    id: 4, name: "Sony WH-1000XM5", brand: "Sony", price: 29999, originalPrice: 34999,
    discount: 14, rating: 4.8, reviews: 4291, inStock: true, badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=480&fit=crop&auto=format",
    description: "Industry-leading noise cancellation with 8 microphones and 2 processors. 30-hour battery, multipoint connection, and speak-to-chat.",
    specs: { Driver: "30 mm", Frequency: "4-40,000 Hz", Battery: "30 hours", "Quick Charge": "3 min → 3 hrs", Bluetooth: "5.2", Codec: "LDAC, AAC, SBC", Weight: "250 g" },
  },
  {
    id: 5, name: "iPhone 16 Pro", brand: "Apple", price: 119900, originalPrice: 134900,
    discount: 11, rating: 4.9, reviews: 6128, inStock: true, badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=480&fit=crop&auto=format",
    description: "A18 Pro chip with 6-core GPU. 48 MP Fusion camera system with 5× optical zoom. ProMotion always-on display. Premium titanium design.",
    specs: { Chip: "A18 Pro", Display: "6.3\" Super Retina XDR", Camera: "48 MP + 12 MP + 12 MP", Zoom: "5× optical", Battery: "27 hrs video", Storage: "128 GB-1 TB", "5G": "Yes" },
  },
];

export const fmtPrice = (p: number) => "₹" + p.toLocaleString("en-IN");

export const salesData = [
  { month: "Jan", revenue: 420, orders: 340 }, { month: "Feb", revenue: 530, orders: 420 },
  { month: "Mar", revenue: 610, orders: 510 }, { month: "Apr", revenue: 480, orders: 380 },
  { month: "May", revenue: 720, orders: 590 }, { month: "Jun", revenue: 850, orders: 680 },
  { month: "Jul", revenue: 930, orders: 740 }, { month: "Aug", revenue: 780, orders: 630 },
];

export const addUserNotification = (email: string, title: string, message: string, type: string = "info") => {
  if (typeof window === "undefined" || !email) return;
  const key = `electrohub_user_notifications_${email.trim().toLowerCase()}`;
  let current: any[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) current = JSON.parse(raw);
  } catch {}
  const newNotif = {
    id: "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    title,
    message,
    type,
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · Today",
    read: false,
  };
  const updated = [newNotif, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
};
