import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription,JSON.stringify(payload));
  } catch (err) {
    console.error("Push failed:", err.statusCode);
  }
};

export default sendPushNotification;
