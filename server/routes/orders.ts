import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

// Fallback in-memory orders
let inMemoryOrders: any[] = [
  {
    id: 1,
    orderNumber: "ORD-2025-8841",
    customerName: "Kaushik Ganesh",
    customerEmail: "kaushikganesh1512@gmail.com",
    shippingAddress: "123 Tech Park, MG Road, Bengaluru",
    paymentMethod: "UPI / Card",
    totalAmount: 129900,
    status: "Delivered",
    createdAt: new Date().toISOString(),
    items: [
      { id: 101, productName: "MacBook Air M4", quantity: 1, price: 129900 },
    ],
  },
];

// GET /api/orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    if (orders && orders.length > 0) {
      res.json(orders);
      return;
    }
  } catch {
    // Fallback
  }
  res.json(inMemoryOrders);
});

// POST /api/orders - Create order, reduce product stock count, link user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, shippingAddress, paymentMethod, items, totalAmount, userId } = req.body;

    if (!customerName || !items || !items.length) {
      res.status(400).json({ error: "Customer info and order items are required" });
      return;
    }

    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    const calcTotal = totalAmount || items.reduce((sum: number, item: any) => sum + item.price * (item.qty || item.quantity || 1), 0);
    const email = (customerEmail || "guest@electrohub.com").trim().toLowerCase();

    let createdOrder;
    try {
      // Find matching user in PostgreSQL database to link order
      let matchedUserId = userId;
      if (!matchedUserId && email) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) matchedUserId = dbUser.id;
      }

      createdOrder = await prisma.order.create({
        data: {
          orderNumber: orderNum,
          customerName,
          customerEmail: email,
          shippingAddress: shippingAddress || "Default Shipping Address",
          paymentMethod: paymentMethod || "Credit Card",
          totalAmount: calcTotal,
          status: "Processing",
          userId: matchedUserId || undefined,
          items: {
            create: items.map((item: any) => ({
              productId: item.id || 1,
              productName: item.name || item.productName || "Product",
              quantity: item.qty || item.quantity || 1,
              price: item.price || 0,
            })),
          },
        },
        include: { items: true },
      });

      // Reduce product stock count in PostgreSQL for each purchased item
      for (const item of items) {
        const pid = item.id || item.productId;
        const qty = item.qty || item.quantity || 1;
        if (pid) {
          try {
            const prod = await prisma.product.findUnique({ where: { id: pid } });
            if (prod) {
              const currentStock = (prod as any).stock ?? 50;
              const newStock = Math.max(0, currentStock - qty);
              await prisma.product.update({
                where: { id: pid },
                data: {
                  stock: newStock,
                  inStock: newStock > 0,
                } as any,
              });
            }
          } catch (stErr) {
            console.warn("Stock update warning for product:", pid, stErr);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Database order creation fallback:", dbErr);
      createdOrder = {
        id: Date.now(),
        orderNumber: orderNum,
        customerName,
        customerEmail: email,
        shippingAddress: shippingAddress || "Default Shipping Address",
        paymentMethod: paymentMethod || "Credit Card",
        totalAmount: calcTotal,
        status: "Processing",
        createdAt: new Date().toISOString(),
        items: items.map((item: any, idx: number) => ({
          id: idx + 1,
          productName: item.name || item.productName || "Product",
          quantity: item.qty || item.quantity || 1,
          price: item.price || 0,
        })),
      };
      inMemoryOrders.unshift(createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to place order" });
  }
});

export default router;
