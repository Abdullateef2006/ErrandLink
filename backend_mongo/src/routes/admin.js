const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/auth");

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
};

router.get("/dashboard", auth, isAdmin, ctrl.getDashboard);
router.get("/users", auth, isAdmin, ctrl.listUsers);
router.post("/users/:userId/verify", auth, isAdmin, ctrl.verifyUser);

module.exports = router;
