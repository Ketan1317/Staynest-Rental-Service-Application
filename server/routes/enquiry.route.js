import express from "express"
import { closeEnquiry, createEnquiry, deleteEnquiry, getMessages, getOwnerEnquiries, getUserEnquiries, sendMessage } from "../controllers/userController/enquiry.controller.js";
import authMiddleWare from "../middlewares/auth.js";
import checkForRightOwner from "../middlewares/requirePropertyOwner.js";

const enquiryRouter =  express.Router();

enquiryRouter.post("/create",authMiddleWare,createEnquiry);
enquiryRouter.post("/message/:enquiryId",authMiddleWare, sendMessage);

enquiryRouter.get("/user",authMiddleWare, getUserEnquiries);
enquiryRouter.get("/owner",authMiddleWare, getOwnerEnquiries);
enquiryRouter.get("/messages/:enquiryId",authMiddleWare, getMessages);

enquiryRouter.post("/close/:enquiryId",authMiddleWare, closeEnquiry);
enquiryRouter.post("/delete/:enquiryId",authMiddleWare, deleteEnquiry);


export {enquiryRouter};

