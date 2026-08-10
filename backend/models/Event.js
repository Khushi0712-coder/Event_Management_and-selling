import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: String,
    location: { type: String, required: true },
    date: { type: String, required: true },
    time: String,
    price: Number,
    image: String,
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
