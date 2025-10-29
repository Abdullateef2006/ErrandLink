const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");

class PaymentService {
  static async holdPayment(orderId, requesterId, amount) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(requesterId).session(session);
      if (!user || user.walletBalance < amount)
        throw new Error("Insufficient funds");
      user.walletBalance -= amount;
      await user.save({ session });
      // create a simple hold record on order
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { escrowHeld: amount } },
        { session }
      );
      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  static async releasePayment(orderId, runnerId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(orderId).session(session);
      if (!order || !order.escrowHeld) throw new Error("No held payment");
      const fee = order.escrowHeld * 0.12;
      const runner = await User.findById(runnerId).session(session);
      if (!runner) throw new Error("Runner not found");
      runner.walletBalance += order.escrowHeld - fee;
      order.escrowHeld = 0;
      await runner.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  static async refundPayment(orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(orderId).session(session);
      if (!order || !order.escrowHeld) throw new Error("No held payment");
      const requester = await User.findById(order.requester).session(session);
      if (!requester) throw new Error("Requester not found");
      requester.walletBalance += order.escrowHeld;
      order.escrowHeld = 0;
      await requester.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}

module.exports = PaymentService;
