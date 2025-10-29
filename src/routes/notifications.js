const express = require("express");
const router = express.Router();
const { User } = require("../models");
const auth = require("../middleware/auth");
const NotificationService = require("../services/notificationService");

router.post("/token", auth, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    await User.update(
      { fcmToken: token },
      {
        where: { id: req.user.id },
      }
    );

    // Subscribe to relevant notification topics
    if (req.user.role === "runner") {
      // Subscribe to new errand notifications for runner's area
      // Simple geographic grid: "{lat}-{lng}" rounded to 1 decimal place
      const lat = Math.round(req.user.lat * 10) / 10;
      const lng = Math.round(req.user.lng * 10) / 10;
      await NotificationService.subscribeToTopic(
        token,
        `errands_${lat}_${lng}`
      );
    }

    res.json({ message: "Token updated successfully" });
  } catch (err) {
    next(err);
  }
});
