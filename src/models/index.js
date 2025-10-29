const { Sequelize } = require("sequelize");
const path = require("path");

const databaseUrl =
  process.env.DATABASE_URL || "sqlite:./data/errandlink.sqlite";

const sequelize = new Sequelize(databaseUrl, {
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user")(sequelize);
db.Errand = require("./errand")(sequelize);
db.Wallet = require("./wallet")(sequelize);
db.Message = require("./message")(sequelize);
db.Review = require("./review")(sequelize);

// Associations
db.User.hasOne(db.Wallet, { foreignKey: "userId", onDelete: "CASCADE" });
db.Wallet.belongsTo(db.User, { foreignKey: "userId" });

db.User.hasMany(db.Errand, { foreignKey: "requesterId", as: "requests" });
db.User.hasMany(db.Errand, { foreignKey: "runnerId", as: "runs" });
db.Errand.belongsTo(db.User, { foreignKey: "requesterId", as: "requester" });
db.Errand.belongsTo(db.User, { foreignKey: "runnerId", as: "runner" });

db.User.hasMany(db.Message, { foreignKey: "senderId" });
db.Message.belongsTo(db.User, { foreignKey: "senderId", as: "sender" });
db.Errand.hasMany(db.Message, { foreignKey: "errandId" });

// Review associations
db.User.hasMany(db.Review, { foreignKey: "reviewerId", as: "givenReviews" });
db.User.hasMany(db.Review, { foreignKey: "targetId", as: "receivedReviews" });
db.Review.belongsTo(db.User, { foreignKey: "reviewerId", as: "reviewer" });
db.Review.belongsTo(db.User, { foreignKey: "targetId", as: "target" });
db.Errand.hasMany(db.Review, { foreignKey: "errandId" });

module.exports = db;
