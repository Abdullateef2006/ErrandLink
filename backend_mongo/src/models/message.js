const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: {
      type: String,
      enum: ["chat", "dispute", "system"],
      default: "chat",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
