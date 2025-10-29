const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.post("/", auth, ctrl.createReview);
router.get("/me", auth, ctrl.getMyReviews);
router.get("/user/:userId", auth, ctrl.getReviews);

module.exports = router;
