const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User, Message } = require("./models");

let io;

function initSocket(server) {
  io = new Server(server, { cors: { origin: "*" } });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "change_me_long_secret"
      );
      const user = await User.findByPk(payload.id);
      if (user) socket.user = { id: user.id, name: user.name };
    } catch (err) {}
    next();
  });

  io.on("connection", (socket) => {
    if (socket.user) socket.join(`user:${socket.user.id}`);
    socket.on("joinErrand", (errandId) => socket.join(`errand:${errandId}`));
    socket.on("message", async (data) => {
      // { errandId, text }
      if (!socket.user) return;
      const m = await Message.create({
        text: data.text,
        senderId: socket.user.id,
        errandId: data.errandId,
      });
      io.to(`errand:${data.errandId}`).emit("message", {
        id: m.id,
        text: m.text,
        senderId: m.senderId,
        errandId: m.errandId,
      });
    });
  });
}

module.exports = { initSocket, io };
