import Booking from "../models/Booking.js";

/* ================= CREATE BOOKING ================= */
export const createBooking = async (req, res) => {
  try {
    const ticketCount = Number(req.body.ticketCount || req.body.tickets || 1);
    const totalPrice = Number(req.body.totalPrice || req.body.totalAmount || 0);

    const booking = await Booking.create({
      user: req.user.id,
      event: req.body.event,
      eventName: req.body.eventName,
      eventDate: req.body.eventDate,
      location: req.body.location,
      ticketCount,
      tickets: ticketCount,
      totalPrice,
      totalAmount: totalPrice,
      paymentStatus: req.body.paymentStatus || "Paid",
      bookingStatus: req.body.bookingStatus || "Pending",
    });

    // populate event and user for immediate frontend usage
    const populated = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("event", "title date time location image");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
};

/* ================= GET MY BOOKINGS ================= */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("event", "title date time location image")
      .populate("user", "name email");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title date time location image")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // allow owner or admin
    if (String(booking.user._id) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};
