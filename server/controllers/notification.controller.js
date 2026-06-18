import mongoose from "mongoose";
import {Notification} from "../models/notification.model.js";
import User from "../models/user.model.js";
import sendPushNotification from "../services/notification.service.js";

export const createNotification = async (recipientId, type, message, relatedPropertyId = null, relatedEnquiryId = null) => {
  try {
    
    const notification = await Notification.create({recipientId, type, message, relatedPropertyId, relatedEnquiryId,});

    // Send push notification if user has subscription
    const user = await User.findById(recipientId).select('pushSubscription');

    if (user?.pushSubscription) {
      await sendPushNotification(user.pushSubscription, {
        title: getNotificationTitle(type),
        body: message,
        icon: '../../assets/back.jpeg',
        badge: '../../assets/front.jpeg',
        data: {type,relatedPropertyId,relatedEnquiryId,notificationId: notification._id,},
      });
    }

    return notification;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    throw error;
  }
};

const getNotificationTitle = (type) => {
  switch (type) {
    case "NEW_ENQUIRY":
      return "New Enquiry";
    case "ENQUIRY_REPLY":
      return "Enquiry Reply";
    case "NEW_QUERY":
      return "New Query";
    case "PROPERTY_OCCUPIED":
      return "Property Occupied";
    default:
      return "Notification";
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ recipientId: userId })
      .populate('relatedPropertyId', 'title location')
      .populate('relatedEnquiryId', 'status')

    res.json({ success: true, notifications});
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: "Valid notificationId required" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL AS READ ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};