import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
  sellTicket,
  getMySoldTickets,
} from "../controllers/sellTicketController.js";

const router = express.Router();

router.post("/", protect, upload.single("proof"), sellTicket);
router.get("/my", protect, getMySoldTickets);

export default router;
