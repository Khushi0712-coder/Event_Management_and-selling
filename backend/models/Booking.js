import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventName: {
      type: String,
      required: true,
    },

    eventDate: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    ticketCount: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
