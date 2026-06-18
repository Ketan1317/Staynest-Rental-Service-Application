import Property from "../../models/property.model.js";

const markPropertyInterest = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { propertyId } = req.params;

    const prop = await Property.findById(propertyId);

    if (!prop) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const alreadyInterested = prop.interestedUsers.includes(req.user.id);

    if (alreadyInterested) {
      return res.status(400).json({
        success: false,
        message: "Already marked as interested"
      });
    }

    prop.interestedUsers.push(req.user.id);

    await prop.save();

    return res.status(200).json({
      success: true,
      message: "Interest marked successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark interest"
    });
  }
};

const withdrawInterest = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { propertyId } = req.params;

    const prop = await Property.findById(propertyId);

    if (!prop) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const alreadyInterested = prop.interestedUsers.includes(req.user.id);

    if (!alreadyInterested) {
      return res.status(400).json({
        success: false,
        message: "You have not marked interest"
      });
    }

    prop.interestedUsers = prop.interestedUsers.filter(
      (id) => id.toString() !== req.user.id
    );

    await prop.save();

    return res.status(200).json({
      success: true,
      message: "Interest removed successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to withdraw interest"
    });
  }
};

export { markPropertyInterest, withdrawInterest }