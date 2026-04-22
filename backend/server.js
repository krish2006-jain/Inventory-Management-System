import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import supplierRoutes from "./routes/suppliers.js";
import productRoutes from "./routes/products.js";
import purchaseRoutes from "./routes/purchases.js";
import userRoutes from "./routes/users.js";
import dashboardRoutes from "./routes/dashboard.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Stockly API running" });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${PORT}`);
});
