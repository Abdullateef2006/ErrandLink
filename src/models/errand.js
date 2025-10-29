const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Errand = sequelize.define("Errand", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    budget: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM(
        "open",
        "accepted",
        "in_progress",
        "completed",
        "cancelled"
      ),
      defaultValue: "open",
    },
    pickupLat: { type: DataTypes.FLOAT },
    pickupLng: { type: DataTypes.FLOAT },
    dropLat: { type: DataTypes.FLOAT },
    dropLng: { type: DataTypes.FLOAT },
    deadline: { type: DataTypes.DATE },
    requesterId: { type: DataTypes.INTEGER },
    runnerId: { type: DataTypes.INTEGER },
  });

  return Errand;
};
