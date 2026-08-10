import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import {
  getSellTickets,
  updateSellTicketStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../controllers/adminController.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.get("/users", protect, adminOnly, getUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id/status", protect, adminOnly, updateUserStatus);
router.get("/sell-tickets", protect, adminOnly, getSellTickets);
router.put("/sell-ticket/:id", protect, adminOnly, updateSellTicketStatus);

export default router;
