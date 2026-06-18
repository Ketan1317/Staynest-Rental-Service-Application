import mongoose from "mongoose";


const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },

    propertyType: {
      type: String,
      enum: ["PG", "ROOM", "FLAT"],
      required: true,
    },

    rent: {
      type: Number,
      required: true,
      min: 0,
    },

    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    sharingType: {
      type: Number, // 1, 2, 3, 4 sharing
      required: true,
      min: 1,
      max: 10,
    },

    genderPreference: {
      type: String,
      enum: ["MALE", "FEMALE", "ANY"],
      default: "ANY",
    },

    amenities: {
      type: [String],
      default: [],
    },

    rules: {
      type: [String],
      default: [],
    },

    images: {
      type: [String], // Cloudinary / S3 URLs
      validate: [
        (arr) => arr.length <= 10,
        "Maximum 10 images allowed",
      ],
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["LIVE", "OCCUPIED"],
      default: "LIVE",
    },
    interestedUsers:{
      type:[mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search
propertySchema.index({ city: 1, area: 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ propertyType: 1 });

const Property = mongoose.model("Property", propertySchema);

export default Property;


