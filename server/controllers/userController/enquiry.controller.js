import mongoose from "mongoose";
import Enquiry from "../../models/enquiry.model.js";
import Property from "../../models/property.model.js";
import EnquiryMessage from "../../models/enquiryMessage.model.js";
import { createNotification } from "../notification.controller.js";

const createEnquiry = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid propertyId required" });
    }

    let enquiry = await Enquiry.findOne({
      propertyId,
      userId,
      isDeleted: false,
    });

    if (enquiry) {
      return res.status(200).json({ success: true, enquiry });
    }

    const property = await Property.findById(propertyId).lean();

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    enquiry = await Enquiry.create({
      propertyId,
      userId,
      ownerId: property.ownerId,
    });

    // Create notification for property owner
    await createNotification(
      property.ownerId,
      "NEW_ENQUIRY",
      `New enquiry received for your property: ${property.title}`,
      propertyId,
      enquiry._id,
    );

    return res.status(201).json({ success: true, enquiry });
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { enquiryId } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message required" });
    }

    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid enquiryId" });
    }

    const enquiry = await Enquiry.findById(enquiryId).populate(
      "propertyId",
      "title",
    );

    if (!enquiry || enquiry.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    const isUser = userId === enquiry.userId.toString();
    const isOwner = userId === enquiry.ownerId.toString();

    if (!isUser && !isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const msg = await EnquiryMessage.create({
      enquiryId,
      senderId: userId,
      senderRole: req.user.role,
      message: message.trim(),
    });

    let update = {
      lastMessageAt: Date.now(),
      lastMessage: message.trim(),
      status: "RESPONDED",
    };

    if (isUser) {
      update["unreadCount.owner"] = enquiry.unreadCount.owner + 1;
    } else {
      update["unreadCount.user"] = enquiry.unreadCount.user + 1;
    }

    await Enquiry.findByIdAndUpdate(enquiryId, update);

    // Create notification for the other party
    const recipientId = isUser ? enquiry.ownerId : enquiry.userId;
    const senderName = req.user.name || "Someone";
    await createNotification(
      recipientId,
      "ENQUIRY_REPLY",
      `${senderName} replied to your enquiry for ${enquiry.propertyId.title}: ${message.trim().substring(0, 100)}${message.trim().length > 100 ? "..." : ""}`,
      enquiry.propertyId._id,
      enquiryId,
    );

    return res.status(201).json({ success: true, msg });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
      return res.status(400).json({ success: false, message: "Invalid enquiryId" });
    }

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    const messages = await EnquiryMessage.find({ enquiryId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 })
      .lean();

    const isUser = req.user.id === enquiry.userId.toString();
    const isOwner = req.user.id === enquiry.ownerId.toString();

    if (isUser) {
      await Enquiry.findByIdAndUpdate(enquiryId, {
        "unreadCount.user": 0,
      });
    }

    if (isOwner) {
      await Enquiry.findByIdAndUpdate(enquiryId, {
        "unreadCount.owner": 0,
      });
    }

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

const getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      userId: req.user.id,
      isDeleted: false,
    })
      .populate("ownerId", "name")
      .sort({ lastMessageAt: -1 })
      .lean();

    return res.json({ success: true, enquiries });
  } catch (error) {
    console.error("USER ENQUIRIES ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

const getOwnerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      ownerId: req.user.id,
      isDeleted: false,
    })
      .populate("propertyId", "title city")
      .sort({ lastMessageAt: -1 })
      .lean();

    return res.json({ success: true, enquiries });
  } catch (error) {
    console.error("OWNER ENQUIRIES ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

const closeEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false });
    }

    const isOwner = req.user.id === enquiry.ownerId.toString();

    if (!isOwner) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can close" });
    }

    enquiry.status = "CLOSED";
    await enquiry.save();

    return res.json({ success: true, message: "Enquiry closed" });
  } catch (error) {
    console.error("CLOSE ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ success: false });
    }

    const isUser = req.user.id === enquiry.userId.toString();

    if (!isUser) {
      return res
        .status(403)
        .json({ success: false, message: "Only user can delete" });
    }

    enquiry.isDeleted = true;
    await enquiry.save();

    return res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

export {
  createEnquiry,
  sendMessage,
  closeEnquiry,
  deleteEnquiry,
  getMessages,
  getUserEnquiries,
  getOwnerEnquiries,
};
