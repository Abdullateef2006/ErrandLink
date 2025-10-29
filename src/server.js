const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
initSocket(server);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    // seed admin user if none
    const { User, Wallet } = require("./models");
    const admin = await User.findOne({ where: { role: "admin" } });
    if (!admin) {
      const a = await User.create({
        name: "Admin",
        email: "admin@errandlink.local",
        password: "adminpass",
        role: "admin",
        verified: true,
      });
      await Wallet.create({ userId: a.id, balance: 0 });
    }

    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
})();
