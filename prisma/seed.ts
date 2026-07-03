import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PRODUCTS = [
  {
    name: "MacBook Air M4",
    brand: "Apple",
    price: 129900,
    originalPrice: 149900,
    discount: 13,
    rating: 4.9,
    reviews: 2847,
    inStock: true,
    badge: "Best Seller",
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=480&fit=crop&auto=format",
    description: "Supercharged by the M4 chip with a 10-core CPU and 10-core GPU. Up to 18-hour battery life on a stunning 13.6-inch Liquid Retina display.",
    specs: JSON.stringify({ Chip: "Apple M4", CPU: "10-core", Memory: "16 GB unified", Storage: "256 GB SSD", Display: '13.6" Liquid Retina' }),
  },
  {
    name: "Samsung Neo QLED 4K TV",
    brand: "Samsung",
    price: 189999,
    originalPrice: 239999,
    discount: 21,
    rating: 4.7,
    reviews: 1524,
    inStock: true,
    badge: "Hot Deal",
    category: "TVs",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=480&fit=crop&auto=format",
    description: '65" Neo QLED 4K with Quantum Matrix Technology and Neural Quantum Processor 4K. Deep blacks, vibrant colours, and Tizen Smart Hub.',
    specs: JSON.stringify({ Size: "65 inches", Resolution: "4K UHD", HDR: "HDR10+, HLG", "Refresh Rate": "120 Hz" }),
  },
  {
    name: "LG French Door Refrigerator",
    brand: "LG",
    price: 89999,
    originalPrice: 104999,
    discount: 14,
    rating: 4.6,
    reviews: 876,
    inStock: true,
    badge: undefined,
    category: "Appliances",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=480&fit=crop&auto=format",
    description: "26 cu ft InstaView door-in-door refrigerator with craft ice maker, Door Cooling+, and LG ThinQ AI smart diagnosis.",
    specs: JSON.stringify({ Capacity: "26 cu ft", Type: "French Door", Stars: "5 Star" }),
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 29999,
    originalPrice: 34999,
    discount: 14,
    rating: 4.8,
    reviews: 4291,
    inStock: true,
    badge: "Top Rated",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=480&fit=crop&auto=format",
    description: "Industry-leading noise cancellation with 8 microphones and 2 processors. 30-hour battery, multipoint connection, and speak-to-chat.",
    specs: JSON.stringify({ Driver: "30 mm", Battery: "30 hours", Bluetooth: "5.2" }),
  },
  {
    name: "iPhone 16 Pro",
    brand: "Apple",
    price: 119900,
    originalPrice: 134900,
    discount: 11,
    rating: 4.9,
    reviews: 6128,
    inStock: true,
    badge: "New Arrival",
    category: "Mobiles",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=480&fit=crop&auto=format",
    description: "A18 Pro chip with 6-core GPU. 48 MP Fusion camera system with 5× optical zoom. ProMotion always-on display. Premium titanium design.",
    specs: JSON.stringify({ Chip: "A18 Pro", Display: '6.3" Super Retina XDR', Camera: "48 MP + 12 MP + 12 MP" }),
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed Admin Account
  const adminPasswordHash = await bcrypt.hash("kaushik1512", 10);
  const admin = await prisma.user.upsert({
    where: { email: "kaushikganesh1512@gmail.com" },
    update: {
      password: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Kaushik Ganesh (Admin)",
      email: "kaushikganesh1512@gmail.com",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin account initialized:", admin.email);

  // Seed Products
  for (const prod of DEFAULT_PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }
  console.log("Products seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
