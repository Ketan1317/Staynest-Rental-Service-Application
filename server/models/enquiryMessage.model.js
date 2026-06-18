import mongoose from "mongoose";


const enquiryMessageSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enquiry",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["USER", "OWNER"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

enquiryMessageSchema.index({ enquiryId: 1, createdAt: 1 });

const EnquiryMessage = mongoose.model("EnquiryMessage", enquiryMessageSchema
);

export default EnquiryMessage;
