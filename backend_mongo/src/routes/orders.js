const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/orderController");
const auth = require("../middleware/auth");

router.post("/", auth, ctrl.createOrder);
router.get("/", auth, ctrl.listOpen);
router.get("/:id", auth, ctrl.getOrder);
router.post("/:id/accept", auth, ctrl.acceptOrder);
router.patch("/:id/status", auth, ctrl.updateStatus);

module.exports = router;
