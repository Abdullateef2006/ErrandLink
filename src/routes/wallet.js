const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/walletController");
const auth = require("../middleware/auth");

router.get("/", auth, ctrl.getWallet);
router.post("/deposit", auth, ctrl.deposit);

module.exports = router;
