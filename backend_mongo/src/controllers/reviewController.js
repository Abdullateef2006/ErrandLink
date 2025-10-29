const Review = require("../models/review");
const User = require("../models/user");
const Joi = require("joi");

exports.createReview = async (req, res, next) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().allow(""),
      targetId: Joi.string().required(),
      orderId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const review = new Review({
      rating: value.rating,
      comment: value.comment,
      reviewer: req.user._id,
      target: value.targetId,
      order: value.orderId,
    });
    await review.save();

    // update target rating (simple avg)
    const reviews = await Review.find({ target: value.targetId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(value.targetId, { rating: avg });

    res.json(review);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ target: userId }).populate(
      "reviewer",
      "name"
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
