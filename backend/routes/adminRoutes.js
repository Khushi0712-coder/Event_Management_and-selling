import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getSellTickets,
  updateSellTicketStatus,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.get("/sell-tickets", protect, adminOnly, getSellTickets);
router.put("/sell-ticket/:id", protect, adminOnly, updateSellTicketStatus);

export default router;
