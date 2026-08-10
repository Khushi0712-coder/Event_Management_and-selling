import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvents,
  updateAdminEvent,
} from "../controllers/adminEventController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAdminEvents);
router.post("/", protect, adminOnly, upload.single("image"), createAdminEvent);
router.put("/:id", protect, adminOnly, upload.single("image"), updateAdminEvent);
router.delete("/:id", protect, adminOnly, deleteAdminEvent);

export default router;
