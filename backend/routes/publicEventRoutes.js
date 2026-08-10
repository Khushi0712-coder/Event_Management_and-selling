import express from "express";
import { getPublishedEvents } from "../controllers/publicEventController.js";

const router = express.Router();

router.get("/", getPublishedEvents);

export default router;
