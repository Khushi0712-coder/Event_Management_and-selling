import Event from "../models/Event.js";

export const getPublishedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "Published" }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Get published events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};
