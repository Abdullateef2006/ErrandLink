const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define("Message", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    errandId: { type: DataTypes.INTEGER },
    type: {
      type: DataTypes.ENUM("chat", "dispute", "system"),
      defaultValue: "chat",
    },
  });

  return Message;
};
