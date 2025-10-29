const Joi = require("joi");
const { Wallet } = require("../models");

exports.getWallet = async (req, res, next) => {
  try {
    const w = await Wallet.findOne({ where: { userId: req.user.id } });
    res.json(w || { balance: 0 });
  } catch (err) {
    next(err);
  }
};

exports.deposit = async (req, res, next) => {
  try {
    const schema = Joi.object({ amount: Joi.number().positive().required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const [w] = await Wallet.findAll({ where: { userId: req.user.id } });
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    wallet.balance += value.amount;
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    next(err);
  }
};
