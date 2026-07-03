import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

let inMemoryProducts = [
  {
    id: 1, name: "MacBook Air M4", brand: "Apple", price: 129900, originalPrice: 149900,
    discount: 13, rating: 4.9, reviews: 2847, inStock: true, badge: "Best Seller", category: "Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=480&fit=crop&auto=format",
    description: "Supercharged by the M4 chip with a 10-core CPU and 10-core GPU. Up to 18-hour battery life on a stunning 13.6-inch Liquid Retina display.",
    specs: { Chip: "Apple M4", CPU: "10-core", Memory: "16 GB unified", Storage: "256 GB SSD" },
  },
  {
    id: 2, name: "Samsung Neo QLED 4K TV", brand: "Samsung", price: 189999, originalPrice: 239999,
    discount: 21, rating: 4.7, reviews: 1524, inStock: true, badge: "Hot Deal", category: "TVs",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=480&fit=crop&auto=format",
    description: '65" Neo QLED 4K with Quantum Matrix Technology and Neural Quantum Processor 4K. Deep blacks, vibrant colours, and Tizen Smart Hub.',
    specs: { Size: "65 inches", Resolution: "4K UHD", HDR: "HDR10+, HLG" },
  },
  {
    id: 3, name: "LG French Door Refrigerator", brand: "LG", price: 89999, originalPrice: 104999,
    discount: 14, rating: 4.6, reviews: 876, inStock: true, category: "Appliances",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=480&fit=crop&auto=format",
    description: "26 cu ft InstaView door-in-door refrigerator with craft ice maker, Door Cooling+, and LG ThinQ AI smart diagnosis.",
    specs: { Capacity: "26 cu ft", Type: "French Door", Stars: "5 Star" },
  },
  {
    id: 4, name: "Sony WH-1000XM5", brand: "Sony", price: 29999, originalPrice: 34999,
    discount: 14, rating: 4.8, reviews: 4291, inStock: true, badge: "Top Rated", category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=480&fit=crop&auto=format",
    description: "Industry-leading noise cancellation with 8 microphones and 2 processors. 30-hour battery, multipoint connection, and speak-to-chat.",
    specs: { Driver: "30 mm", Battery: "30 hours", Bluetooth: "5.2" },
  },
  {
    id: 5, name: "iPhone 16 Pro", brand: "Apple", price: 119900, originalPrice: 134900,
    discount: 11, rating: 4.9, reviews: 6128, inStock: true, badge: "New Arrival", category: "Mobiles",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=480&fit=crop&auto=format",
    description: "A18 Pro chip with 6-core GPU. 48 MP Fusion camera system with 5× optical zoom. ProMotion always-on display. Premium titanium design.",
    specs: { Chip: "A18 Pro", Display: '6.3" Super Retina XDR', Camera: "48 MP + 12 MP + 12 MP" },
  },
];

router.get("/", async (req: Request, res: Response) => {
  try {
    const dbProducts = await prisma.product.findMany({ orderBy: { id: "asc" } });
    const formattedDb = (dbProducts || []).map((p) => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : undefined,
    }));

    const productMap = new Map<number, any>();
    inMemoryProducts.forEach((p) => productMap.set(p.id, p));
    formattedDb.forEach((p) => productMap.set(p.id, p));

    res.json(Array.from(productMap.values()));
    return;
  } catch {
    // Fallback
  }
  res.json(inMemoryProducts);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) {
      res.json({
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : undefined,
      });
      return;
    }
  } catch {
    // Fallback
  }
  const found = inMemoryProducts.find((p) => p.id === id);
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, brand, price, originalPrice, category, description, image, badge, inStock, specs } = req.body;

    if (!name || !brand || !price) {
      res.status(400).json({ error: "Product name, brand, and price are required" });
      return;
    }

    const numPrice = parseFloat(price);
    const numOrig = originalPrice ? parseFloat(originalPrice) : numPrice * 1.15;
    const discountCalc = Math.round(((numOrig - numPrice) / numOrig) * 100);

    let created;
    try {
      created = await prisma.product.create({
        data: {
          name,
          brand,
          price: numPrice,
          originalPrice: numOrig,
          discount: discountCalc,
          rating: 4.8,
          reviews: 1,
          inStock: inStock !== false,
          badge: badge || "New",
          category: category || "Electronics",
          image: image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=480&fit=crop&auto=format",
          description: description || "High performance electronic product.",
          specs: specs ? JSON.stringify(specs) : undefined,
        },
      });
    } catch {
      created = {
        id: Date.now(),
        name,
        brand,
        price: numPrice,
        originalPrice: numOrig,
        discount: discountCalc,
        rating: 4.8,
        reviews: 1,
        inStock: inStock !== false,
        badge: badge || "New",
        category: category || "Electronics",
        image: image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=480&fit=crop&auto=format",
        description: description || "High performance electronic product.",
        specs: specs || {},
      };
      inMemoryProducts.push(created as any);
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
  }
  res.json({ message: `Product ${id} deleted successfully` });
});

export default router;
