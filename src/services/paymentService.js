const { Wallet, Escrow, User, sequelize } = require("../models");

class PaymentService {
  static async holdPayment(errandId, requesterId, amount) {
    const t = await sequelize.transaction();

    try {
      // Check requester wallet
      const wallet = await Wallet.findOne({
        where: { userId: requesterId },
        transaction: t,
      });

      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient funds");
      }

      // Deduct from wallet
      wallet.balance -= amount;
      await wallet.save({ transaction: t });

      // Create escrow hold
      const escrow = await Escrow.create(
        {
          amount,
          errandId,
          requesterId,
          status: "held",
        },
        { transaction: t }
      );

      await t.commit();
      return escrow;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async releasePayment(errandId, runnerId) {
    const t = await sequelize.transaction();

    try {
      const escrow = await Escrow.findOne({
        where: { errandId, status: "held" },
        transaction: t,
      });

      if (!escrow) {
        throw new Error("No held payment found");
      }

      // Calculate platform fee (12%)
      const fee = escrow.amount * 0.12;
      const runnerAmount = escrow.amount - fee;

      // Update runner wallet
      const wallet = await Wallet.findOne({
        where: { userId: runnerId },
        transaction: t,
      });

      if (!wallet) {
        throw new Error("Runner wallet not found");
      }

      wallet.balance += runnerAmount;
      await wallet.save({ transaction: t });

      // Mark escrow as released
      escrow.status = "released";
      escrow.runnerId = runnerId;
      await escrow.save({ transaction: t });

      await t.commit();
      return { escrow, fee, runnerAmount };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async refundPayment(errandId) {
    const t = await sequelize.transaction();

    try {
      const escrow = await Escrow.findOne({
        where: { errandId, status: "held" },
        transaction: t,
      });

      if (!escrow) {
        throw new Error("No held payment found");
      }

      // Return to requester wallet
      const wallet = await Wallet.findOne({
        where: { userId: escrow.requesterId },
        transaction: t,
      });

      if (!wallet) {
        throw new Error("Requester wallet not found");
      }

      wallet.balance += escrow.amount;
      await wallet.save({ transaction: t });

      // Mark escrow as refunded
      escrow.status = "refunded";
      await escrow.save({ transaction: t });

      await t.commit();
      return escrow;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = PaymentService;
