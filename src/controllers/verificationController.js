const { User } = require("../models");
const upload = require("../middleware/upload");

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Update user's document path and set as pending verification
    await User.update(
      {
        documentPath: req.file.path,
        verificationStatus: "pending",
      },
      {
        where: { id: req.user.id },
      }
    );

    res.json({
      message: "Document uploaded successfully",
      status: "pending_verification",
      documentPath: req.file.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Only admins can verify users" });
    }

    await User.update(
      {
        verified: verified,
        verificationStatus: verified ? "verified" : "rejected",
      },
      {
        where: { id: userId },
      }
    );

    res.json({
      message: `User ${verified ? "verified" : "rejected"} successfully`,
    });
  } catch (err) {
    next(err);
  }
};
