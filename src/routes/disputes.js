const express = require("express");
const router = express.Router();
const { Errand, Message } = require("../models");
const auth = require("../middleware/auth");

// File dispute
router.post("/:errandId/dispute", auth, async (req, res, next) => {
  try {
    const { errandId } = req.params;
    const { reason } = req.body;

    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ error: "Errand not found" });
    }

    // Only requester or runner can file dispute
    if (req.user.id !== errand.requesterId && req.user.id !== errand.runnerId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    errand.status = "disputed";
    errand.disputeReason = reason;
    await errand.save();

    // Create dispute message
    await Message.create({
      text: `Dispute filed: ${reason}`,
      senderId: req.user.id,
      errandId: errandId,
      type: "dispute",
    });

    res.json({ message: "Dispute filed successfully", errand });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
