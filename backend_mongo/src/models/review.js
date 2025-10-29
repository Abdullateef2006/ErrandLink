const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
