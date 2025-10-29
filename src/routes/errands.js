const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/errandController");
const auth = require("../middleware/auth");

router.post("/", auth, ctrl.createErrand);
router.get("/", auth, ctrl.listErrands);
router.get("/:id", auth, ctrl.getErrand);
router.post("/:id/accept", auth, ctrl.acceptErrand);
router.patch("/:id/status", auth, ctrl.updateStatus);

module.exports = router;
