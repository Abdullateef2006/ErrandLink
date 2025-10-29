const User = require("../models/user");
const Order = require("../models/order");

exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      platformEarnings: totalRevenue * 0.12,
    });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(
      "name email role verified banned walletBalance"
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.verified = !!verified;
    user.verificationStatus = verified ? "verified" : "rejected";
    await user.save();
    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
};
