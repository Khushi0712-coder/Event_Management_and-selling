import mongoose from "mongoose";

const sellTicketSchema = new mongoose.Schema(
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

    location: {
      type: String,
      required: true,
    },

    eventDate: {
      type: String,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },

    expectedPrice: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
    },

    proofFile: {
      type: String, // 🔥 REQUIRED FOR FILE UPLOAD
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("SellTicket", sellTicketSchema);
