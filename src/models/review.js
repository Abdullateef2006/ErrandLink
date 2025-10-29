const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define("Review", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT },
    reviewerId: { type: DataTypes.INTEGER, allowNull: false },
    targetId: { type: DataTypes.INTEGER, allowNull: false }, // user being reviewed
    errandId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return Review;
};
