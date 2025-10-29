const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/orders", require("./orders"));
router.use("/reviews", require("./reviews"));
router.use("/uploads", require("./uploads"));
router.use("/admin", require("./admin"));

module.exports = router;
