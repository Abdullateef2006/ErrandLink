require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "ErrandLink API" }));
app.use("/api", routes);

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal error" });
});

module.exports = app;
