const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const verificationCtrl = require("../controllers/verificationController");
const auth = require("../middleware/auth");

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Dashboard
router.get("/dashboard", auth, isAdmin, ctrl.getDashboardStats);

// User management
router.get("/users", auth, isAdmin, ctrl.getUsersList);
router.post("/users/:userId/status", auth, isAdmin, ctrl.updateUserStatus);
router.post(
  "/users/:userId/verify",
  auth,
  isAdmin,
  verificationCtrl.verifyUser
);

// Dispute management
router.get("/disputes", auth, isAdmin, ctrl.getDisputesList);
router.post("/disputes/:errandId/resolve", auth, isAdmin, ctrl.resolveDispute);

module.exports = router;
