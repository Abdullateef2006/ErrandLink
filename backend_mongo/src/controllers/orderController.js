const Joi = require("joi");
const Order = require("../models/order");
const PaymentService = require("../services/paymentService");

exports.createOrder = async (req, res, next) => {
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

    // Create order and hold payment
    const order = new Order({
      title: value.title,
      description: value.description,
      budget: value.budget,
      pickup: { lat: value.pickupLat, lng: value.pickupLng },
      dropoff:
        value.dropLat && value.dropLng
          ? { lat: value.dropLat, lng: value.dropLng }
          : undefined,
      deadline: value.deadline,
      requester: req.user._id,
    });
    await order.save();

    // Hold payment from requester wallet
    await PaymentService.holdPayment(order._id, req.user._id, value.budget);

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.listOpen = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const orders = await Order.find({ status: "open" }).populate(
      "requester",
      "name rating lat lng"
    );
    if (lat && lng) {
      // simple haversine filter in JS
      const latn = parseFloat(lat),
        lngn = parseFloat(lng);
      const results = orders
        .map((o) => {
          const d = haversine(latn, lngn, o.pickup?.lat, o.pickup?.lng);
          return { order: o, distance_km: d };
        })
        .filter((x) => x.distance_km <= parseFloat(radius))
        .sort((a, b) => a.distance_km - b.distance_km);
      return res.json(results);
    }
    res.json(orders);
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

exports.acceptOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (order.status !== "open")
      return res.status(400).json({ error: "Order not available" });
    order.runner = req.user._id;
    order.status = "accepted";
    await order.save();
    res.json(order);
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
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Not found" });
    if (!order.runner && status !== "cancelled")
      return res.status(403).json({ error: "No runner assigned" });
    if (
      String(req.user._id) !== String(order.runner) &&
      String(req.user._id) !== String(order.requester)
    )
      return res.status(403).json({ error: "Forbidden" });
    order.status = status;
    await order.save();

    if (status === "completed") {
      await PaymentService.releasePayment(order._id, order.runner);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate(
      "requester runner",
      "name email phone"
    );
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
