const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Wallet = sequelize.define("Wallet", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return Wallet;
};
