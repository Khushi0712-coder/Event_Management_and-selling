import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import sellTicketRoutes from "./routes/sellTicketRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* ====== MIDDLEWARE ====== */
app.use(cors());
app.use(express.json()); // ✅ ONLY ONCE

/* ====== STATIC FILES ====== */
app.use("/uploads", express.static("uploads"));

/* ====== ROUTES ====== */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/sell-ticket", sellTicketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/contact", contactRoutes);

/* ====== SERVER ====== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
