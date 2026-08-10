import Event from "../models/Event.js";

export const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Get admin events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const createAdminEvent = async (req, res) => {
  try {
    const { title, date, location, price, status } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ message: "Title, date, and location are required" });
    }

    const event = await Event.create({
      title,
      date,
      location,
      price: Number(price) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      status: status || "Published",
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Create admin event error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const updateAdminEvent = async (req, res) => {
  try {
    const { title, date, location, price, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (price !== undefined) updateData.price = Number(price) || 0;
    if (status !== undefined) updateData.status = status;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Update admin event error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

export const deleteAdminEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete admin event error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
