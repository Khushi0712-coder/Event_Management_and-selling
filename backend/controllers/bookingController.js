import Booking from "../models/Booking.js";

/* ================= CREATE BOOKING ================= */
export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      user: req.user.id,
      eventName: req.body.eventName,
      eventDate: req.body.eventDate,
      location: req.body.location,
      ticketCount: req.body.ticketCount,
      totalPrice: req.body.totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
};

/* ================= GET MY BOOKINGS ================= */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
