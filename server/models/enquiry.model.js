import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "RESPONDED", "CLOSED"],
      default: "OPEN",
    },
    unreadCount: {
      user: {
        type: Number,
        default: 0,
      },
      owner: {
        type: Number,
        default: 0,
      },
    },
    lastMessage: {
      type: String,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
enquirySchema.index({ propertyId: 1, userId: 1 }, { unique: true });
enquirySchema.index({ ownerId: 1, status: 1 });
enquirySchema.index({ userId: 1, status: 1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
