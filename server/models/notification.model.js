import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "NEW_ENQUIRY",
        "ENQUIRY_REPLY",
        "NEW_QUERY",
        "PROPERTY_OCCUPIED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    relatedPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },

    relatedEnquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enquiry",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 }); // Sort notifications by newest first

const Notification = mongoose.model("Notification", notificationSchema);
export {Notification}


