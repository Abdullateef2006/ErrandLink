const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/errands", require("./errands"));
router.use("/wallet", require("./wallet"));
router.use("/reviews", require("./reviews"));
router.use("/admin", require("./admin"));
router.use("/disputes", require("./disputes"));
router.use("/notifications", require("./notifications"));

// Document verification routes
const verificationCtrl = require("../controllers/verificationController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

router.post(
  "/verify/upload",
  auth,
  upload.single("document"),
  verificationCtrl.uploadDocument
);

module.exports = router;
