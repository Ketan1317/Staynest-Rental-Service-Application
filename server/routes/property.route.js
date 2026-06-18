import express from "express";
import {upload} from "../services/multer.service.js";
import authMiddleWare from "../middlewares/auth.js";
import rbac from "../middlewares/rbac.js";
import {addToFavorites, createProperty, deleteProperty, getAllProperties, getFavorites, getPropertiesByUser, getPropertiesOfOwner, removeFromFavorites} from "../controllers/userController/property.controller.js";
import { createReview, deleteReview } from "../controllers/userController/review.controller.js";
import checkForRightOwner from "../middlewares/requirePropertyOwner.js";

const propertyRouter = express.Router();

propertyRouter.post("/create", authMiddleWare, rbac(["OWNER"]), upload.array("images", 10), createProperty);
propertyRouter.post("/delete/:propertyId", authMiddleWare, rbac(["OWNER"]), deleteProperty);
// For user
propertyRouter.post("/addToFav/:propertyId", authMiddleWare, addToFavorites);
propertyRouter.post("/delFromFav/:propertyId", authMiddleWare, removeFromFavorites);
propertyRouter.get("/getFavorites", authMiddleWare, getFavorites);

//review
propertyRouter.post("/reviews/create", authMiddleWare, createReview);
propertyRouter.post("/reviews/delete/:propertyId", authMiddleWare, deleteReview);

propertyRouter.get("/getAllProperties", getAllProperties);
propertyRouter.get("/getPropertiesOfOwner", authMiddleWare, rbac(["OWNER"]), getPropertiesOfOwner);
propertyRouter.get("/search", getPropertiesByUser);


export default propertyRouter;
