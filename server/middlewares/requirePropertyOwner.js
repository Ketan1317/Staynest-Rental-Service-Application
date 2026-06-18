import Property  from "../models/property.model.js";

const checkForRightOwner = (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const property = Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({success:false, error: "Property not found" });
    }
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({success:false, error: "Access denied. Not the property owner" });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({success:false, error: "Require property owner middleware error" });
  }
};

export default checkForRightOwner;
