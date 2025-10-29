const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Missing authorization header" });
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_me_long_secret"
    );
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
