const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "open",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
        "refunded",
      ],
      default: "open",
    },
    pickup: { lat: Number, lng: Number },
    dropoff: { lat: Number, lng: Number },
    deadline: { type: Date },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    runner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    disputeReason: { type: String },
    disputeResolution: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
