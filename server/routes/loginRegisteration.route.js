import express from "express";
import { userRegister }  from "../controllers/userController/register.controller.js";
import { userLogin } from "../controllers/userController/login.controller.js";
import { upload } from "../services/multer.service.js";


const userRouter  = express.Router();

userRouter.post("/register",upload.single("image"),userRegister);
userRouter.post("/login",userLogin);

export default userRouter;
