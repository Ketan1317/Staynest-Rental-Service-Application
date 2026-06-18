import express from "express";
import User from "../models/user.model.js";
import sendPushNotification from "../services/notification.service.js";
import authMiddleWare from "../middlewares/auth.js";

const pushRouter = express.Router();

// Get VAPID public key
pushRouter.get("/public-key", (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ success: false, message: "VAPID public key not configured" });
  }
  res.json({ publicKey });
});

// Subscribe to push notifications
pushRouter.post("/subscribe", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { subscription } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: "Valid subscription required" });
    }

    await User.findByIdAndUpdate(userId, {
      pushSubscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
        },
      },
    });

    res.json({ success: true, message: "Push subscription saved" });
  } catch (error) {
    console.error("SUBSCRIBE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unsubscribe from push notifications
pushRouter.post("/unsubscribe", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await User.findByIdAndUpdate(userId, {
      $unset: { pushSubscription: 1 },
    });

    res.json({ success: true, message: "Push subscription removed" });
  } catch (error) {
    console.error("UNSUBSCRIBE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send test notification (for development/testing)
pushRouter.post("/notification", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { mainTitle, body } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mainTitle || !body) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }

    const user = await User.findById(userId).select('pushSubscription');

    if (!user?.pushSubscription) {
      return res.status(400).json({ success: false, message: "User not subscribed to push notifications" });
    }

    await sendPushNotification(user.pushSubscription, {
      title: mainTitle,
      body: body,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("SEND NOTIFICATION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default pushRouter;