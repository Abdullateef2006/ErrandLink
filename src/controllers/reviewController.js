const { User, Review, sequelize } = require("../models");
const Joi = require("joi");

exports.createReview = async (req, res, next) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().allow(""),
      targetId: Joi.number().required(),
      errandId: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const review = await Review.create({
      ...value,
      reviewerId: req.user.id,
    });

    // Update user's average rating
    const reviews = await Review.findAll({
      where: { targetId: value.targetId },
      attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avgRating"]],
    });

    if (reviews[0].dataValues.avgRating) {
      await User.update(
        { rating: reviews[0].dataValues.avgRating },
        { where: { id: value.targetId } }
      );
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.findAll({
      where: { targetId: userId },
      include: [{ model: User, as: "reviewer", attributes: ["id", "name"] }],
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { targetId: req.user.id },
      include: [{ model: User, as: "reviewer", attributes: ["id", "name"] }],
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
