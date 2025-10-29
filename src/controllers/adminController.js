const { User, Errand, Wallet, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalErrands,
      totalRunners,
      totalRevenue,
      recentErrands,
    ] = await Promise.all([
      User.count(),
      Errand.count(),
      User.count({ where: { role: "runner" } }),
      Errand.sum("budget", { where: { status: "completed" } }),
      Errand.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: "requester", attributes: ["id", "name"] },
          { model: User, as: "runner", attributes: ["id", "name"] },
        ],
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalErrands,
        totalRunners,
        totalRevenue: totalRevenue || 0,
        platformEarnings: (totalRevenue || 0) * 0.12, // 12% fee
      },
      recentErrands,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsersList = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "verified",
        "rating",
        "createdAt",
      ],
      include: [
        {
          model: Wallet,
          attributes: ["balance"],
        },
      ],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'ban' or 'unban'

    if (!["ban", "unban"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    await User.update(
      {
        banned: action === "ban",
      },
      {
        where: { id: userId },
      }
    );

    res.json({ message: `User ${action}ned successfully` });
  } catch (err) {
    next(err);
  }
};

exports.getDisputesList = async (req, res, next) => {
  try {
    const disputes = await Errand.findAll({
      where: {
        [Op.or]: [{ status: "disputed" }, { "$messages.type$": "dispute" }],
      },
      include: [
        { model: User, as: "requester", attributes: ["id", "name"] },
        { model: User, as: "runner", attributes: ["id", "name"] },
      ],
    });
    res.json(disputes);
  } catch (err) {
    next(err);
  }
};

exports.resolveDispute = async (req, res, next) => {
  try {
    const { errandId } = req.params;
    const { resolution, refundAmount } = req.body;

    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ error: "Errand not found" });
    }

    if (refundAmount) {
      const requesterWallet = await Wallet.findOne({
        where: { userId: errand.requesterId },
      });
      if (requesterWallet) {
        requesterWallet.balance += parseFloat(refundAmount);
        await requesterWallet.save();
      }
    }

    errand.status = resolution === "refund" ? "refunded" : "completed";
    errand.disputeResolution = resolution;
    await errand.save();

    res.json({ message: "Dispute resolved successfully", errand });
  } catch (err) {
    next(err);
  }
};
