const admin = require("firebase-admin");
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

class NotificationService {
  static async sendToUser(userId, title, body, data = {}) {
    try {
      if (!serviceAccount) {
        console.log("Firebase not configured, skipping notification:", {
          userId,
          title,
          body,
        });
        return;
      }

      const user = await User.findByPk(userId);
      if (!user?.fcmToken) return;

      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  }

  static async sendToTopic(topic, title, body, data = {}) {
    try {
      if (!serviceAccount) {
        console.log("Firebase not configured, skipping notification:", {
          topic,
          title,
          body,
        });
        return;
      }

      await admin.messaging().send({
        topic,
        notification: { title, body },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  }

  // Subscribe a user's device to a topic (e.g., for nearby errand notifications)
  static async subscribeToTopic(fcmToken, topic) {
    if (!serviceAccount) return;
    try {
      await admin.messaging().subscribeToTopic(fcmToken, topic);
    } catch (err) {
      console.error("Failed to subscribe to topic:", err);
    }
  }
}

module.exports = NotificationService;
