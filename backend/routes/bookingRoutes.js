import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createBooking,
  getMyBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

/* Create booking */
router.post("/", protect, createBooking);

/* Get logged-in user's bookings */
router.get("/my", protect, getMyBookings);

export default router; // ✅ THIS IS REQUIRED
