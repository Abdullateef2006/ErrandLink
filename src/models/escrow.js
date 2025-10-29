const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Escrow = sequelize.define("Escrow", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("held", "released", "refunded"),
      defaultValue: "held",
    },
    errandId: { type: DataTypes.INTEGER, allowNull: false },
    requesterId: { type: DataTypes.INTEGER, allowNull: false },
    runnerId: { type: DataTypes.INTEGER },
  });

  return Escrow;
};
