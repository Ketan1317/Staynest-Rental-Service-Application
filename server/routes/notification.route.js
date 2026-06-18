import express from "express";
import {getUserNotifications,markAsRead,markAllAsRead,getUnreadCount,} from "../controllers/notification.controller.js";
import authMiddleWare from "../middlewares/auth.js";

const notificationRouter = express.Router();

notificationRouter.use(authMiddleWare);
// Get user's notifications
notificationRouter.get("/", getUserNotifications);

// Get unread count
notificationRouter.get("/unread-count", getUnreadCount);

// Mark specific notification as read
notificationRouter.post("/:notificationId/read", markAsRead);

// Mark all notifications as read
notificationRouter.post("/mark-all-read", markAllAsRead);

export default notificationRouter;
