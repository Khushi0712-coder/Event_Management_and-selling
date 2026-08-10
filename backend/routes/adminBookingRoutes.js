import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import {
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/adminBookingController.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;
