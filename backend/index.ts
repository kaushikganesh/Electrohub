import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`[Backend API] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "ElectroHub Node.js + Express.js API Server is running.",
    health: "/api/health"
  });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "ElectroHub Node.js + Express.js API server running smoothly." });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("Internal API Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Express Backend Server running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
