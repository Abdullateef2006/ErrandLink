const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User, Wallet } = require("../models");

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("requester", "runner").default("requester"),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
});

exports.signup = async (req, res, next) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const user = await User.create(value);
    // create wallet
    await Wallet.create({ userId: user.id, balance: 0 });
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "change_me_long_secret"
    );
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const user = await User.findOne({ where: { email: value.email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await user.comparePassword(value.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "change_me_long_secret"
    );
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    lat: user.lat,
    lng: user.lng,
  });
};
