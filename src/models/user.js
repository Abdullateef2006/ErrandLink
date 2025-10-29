const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("requester", "runner", "admin"),
        defaultValue: "requester",
      },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      verificationStatus: {
        type: DataTypes.ENUM("unverified", "pending", "verified", "rejected"),
        defaultValue: "unverified",
      },
      documentPath: { type: DataTypes.STRING },
      banned: { type: DataTypes.BOOLEAN, defaultValue: false },
      lat: { type: DataTypes.FLOAT },
      lng: { type: DataTypes.FLOAT },
      rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
      fcmToken: { type: DataTypes.STRING },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password)
            user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed("password"))
            user.password = await bcrypt.hash(user.password, 10);
        },
      },
    }
  );

  User.prototype.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
  };

  return User;
};
