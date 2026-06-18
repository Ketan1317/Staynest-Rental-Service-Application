import Property from "../../models/property.model.js";
import { uploadOnCloudinary, uploadSingleImage } from "../../services/cloudinary.service.js";
import User from "../../models/user.model.js";


const createProperty = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { title, description, propertyType, address, city, rent, deposit, sharingType, genderPreference, amenities, rules,} = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !description || !propertyType || !address || !city || !rent || !sharingType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    if (description.length < 20 || description.length > 2000) {
      return res
        .status(400)
        .json({
          message: "Description must be between 20 and 2000 characters",
        });
    }

    if (!["PG", "ROOM", "FLAT"].includes(propertyType)) {
      return res.status(400).json({ message: "Invalid property type" });
    }

    if (rent < 0 || (deposit && deposit < 0)) {
      return res
        .status(400)
        .json({ message: "Rent and deposit must be non-negative" });
    }

    const bunchOfURLS = [];

    for (const file of req.files) {
      const url = await uploadSingleImage(
        file.buffer,
        `property_${Date.now()}`
      );
      bunchOfURLS.push(url);
    }

    const property = await Property.create({
      title,
      description,
      propertyType,
      address,
      city,
      rent,
      deposit,
      sharingType,
      genderPreference,
      amenities,
      rules,
      images: bunchOfURLS,
      ownerId: req.user.id, // from auth middleware
    });

    res
      .status(201)
      .json({
        success: true,
        property,
        message: "Property created successfully",
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create property" });
  }
};

const getAllProperties = async (req, res) => {
  try {

    const properties = await Property.find({});
    if(!properties || properties.length === 0){
      return res.status(404).json({message: "No properties available currently"});
    }

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

const getPropertiesOfOwner = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const properties = await Property.find({ ownerId: req.user.id });
    if(!properties || properties.length === 0){
      return res.status(404).json({message: "No properties have been listed by you yet"});
    }

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};


const getPropertiesByUser = async (req, res) => {
  try {
    const { city, minRent, maxRent, type } = req.query;

    const filter = {};

    if (city) filter.city = city;
    if (type) filter.propertyType = type;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }
    // sorting by newest
    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};


const addToFavorites = async (req, res) => {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { propertyId } = req.params;
    console.log(propertyId);
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const user = await User.findById(req.user.id);
    if (user.favorites.some(id => id.toString() === propertyId)) {
      return res.status(400).json({ message: "Property already in favorites" });
    } 

    user.favorites.push(propertyId);
    await user.save();

    res.status(200).json({ success: true, message: "Added to favorites" }); 
}

const removeFromFavorites = async (req, res) => {
  try { 
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    } 

    const { propertyId } = req.params;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    const user = await User.findById(req.user.id);

    const index = user.favorites.indexOf(propertyId);       
    if (index === -1) {
      return res.status(400).json({ message: "Property not in favorites" });
    }

    user.favorites.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from favorites" });
  } 
}

const getFavorites = async(req,res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
}

const deleteProperty = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { propertyId } = req.params;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  const property = await Property.findById(propertyId);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }     

  if(property.ownerId.toString() !== req.user.id){
    return  res.status(403).json({ message: "Forbidden: You are not the owner of this property" });
  }


  await Property.deleteOne({ _id: propertyId });
  res.status(200).json({ success: true, message: "Property deleted successfully" });
}

export { createProperty, getAllProperties, getPropertiesOfOwner, addToFavorites, removeFromFavorites,deleteProperty,getPropertiesByUser,getFavorites };
