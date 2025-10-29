exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const user = req.user;
    user.documentPath = req.file.path;
    user.verificationStatus = "pending";
    await user.save();
    res.json({ message: "Uploaded", path: req.file.path });
  } catch (err) {
    next(err);
  }
};
