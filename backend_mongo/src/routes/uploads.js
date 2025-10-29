const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadCtrl = require("../controllers/uploadController");
const auth = require("../middleware/auth");

router.post(
  "/document",
  auth,
  upload.single("document"),
  uploadCtrl.uploadDocument
);

module.exports = router;
