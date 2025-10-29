const Joi = require("joi");
const { Errand, User, Wallet } = require("../models");
const { Op, Sequelize } = require("sequelize");

// Haversine formula helper in SQL via raw expression
function distanceSql(lat, lng, colLat, colLng) {
  return Sequelize.literal(
    `(6371 * acos(least(1, cos(radians(${lat})) * cos(radians(${colLat})) * cos(radians(${colLng}) - radians(${lng})) + sin(radians(${lat})) * sin(radians(${colLat})))) )`
  );
}

exports.createErrand = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow(""),
      budget: Joi.number().required(),
      pickupLat: Joi.number().required(),
      pickupLng: Joi.number().required(),
      dropLat: Joi.number(),
      dropLng: Joi.number(),
      deadline: Joi.date().optional(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const errand = await Errand.create({ ...value, requesterId: req.user.id });
    res.json(errand);
  } catch (err) {
    next(err);
  }
};

// list open errands, optionally near a lat/lng and within kms
exports.listErrands = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const where = { status: "open" };
    if (lat && lng) {
      // compute distance and filter using HAVERSINE in JS after fetch for sqlite simplicity
      const errands = await Errand.findAll({ where });
      const latn = parseFloat(lat),
        lngn = parseFloat(lng);
      const result = errands
        .map((e) => {
          const d = haversine(latn, lngn, e.pickupLat, e.pickupLng);
          return { errand: e, distance_km: d };
        })
        .filter((x) => x.distance_km <= parseFloat(radius))
        .sort((a, b) => a.distance_km - b.distance_km);
      return res.json(result);
    }
    const errands = await Errand.findAll({ where });
    res.json(errands);
  } catch (err) {
    next(err);
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  if (lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

exports.acceptErrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errand = await Errand.findByPk(id);
    if (!errand) return res.status(404).json({ error: "Not found" });
    if (errand.status !== "open")
      return res.status(400).json({ error: "Errand not available" });
    errand.runnerId = req.user.id;
    errand.status = "accepted";
    await errand.save();
    res.json(errand);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["in_progress", "completed", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const errand = await Errand.findByPk(id);
    if (!errand) return res.status(404).json({ error: "Not found" });
    // simple permission: runner or requester
    if (req.user.id !== errand.runnerId && req.user.id !== errand.requesterId)
      return res.status(403).json({ error: "Forbidden" });
    errand.status = status;
    await errand.save();

    if (status === "completed") {
      // simulate payment release: transfer budget from escrow (not implemented) to runner wallet minus 12% fee
      const runnerWallet = await Wallet.findOne({
        where: { userId: errand.runnerId },
      });
      if (runnerWallet) {
        const fee = errand.budget * 0.12;
        runnerWallet.balance += errand.budget - fee;
        await runnerWallet.save();
      }
    }

    res.json(errand);
  } catch (err) {
    next(err);
  }
};

exports.getErrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errand = await Errand.findByPk(id, {
      include: [
        { model: User, as: "requester", attributes: ["id", "name", "phone"] },
        { model: User, as: "runner", attributes: ["id", "name", "phone"] },
      ],
    });
    if (!errand) return res.status(404).json({ error: "Not found" });
    res.json(errand);
  } catch (err) {
    next(err);
  }
};
