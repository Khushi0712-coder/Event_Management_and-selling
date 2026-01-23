import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    category: String, // movie, play, sport, activity
    location: String,
    date: String,
    time: String,
    price: Number,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
