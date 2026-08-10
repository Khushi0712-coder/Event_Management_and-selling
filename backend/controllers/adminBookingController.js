import Booking from "../models/Booking.js";

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("event", "title date location image");

    res.json(bookings);
  } catch (err) {
    console.error("Failed fetching admin bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("event", "title date location image");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Failed fetching booking details:", err);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.body.bookingStatus) {
      booking.bookingStatus = req.body.bookingStatus;
    }
    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("event", "title date location image");

    res.json({ booking: updatedBooking });
  } catch (err) {
    console.error("Failed updating booking:", err);
    res.status(500).json({ message: "Failed to update booking" });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("Failed deleting booking:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
};
