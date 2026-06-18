import User from "../../models/user.model.js";
import { uploadSingleImage } from "../../services/cloudinary.service.js";
import sendMail from "../../services/mail.service.js";
import { generateToken } from "../../services/token.service.js";
import bcrypt from "bcryptjs";


export const userRegister = async (req, res) => {
  try {
    const {name,email,password,phone,role} = req.body;
    // console.log(req.body);

    if(!name || !email || !password || !phone){
      return res.status(400).json({success:false, error: "All fields are required"});
    }

    const alreadyExists = await User.findOne({$or: [{email}, {phone}]});
    console.log(alreadyExists);
    if(alreadyExists){
        return res.status(409).json({success:false, error: "User with given email or phone already exists"});
    }

    let url = "";
    if(req.file){
      url = await uploadSingleImage(req.file.buffer, `profile_${Date.now()}`);
    }
    console.log(url);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, phone, profileImage: url, role });
    console.log(user);
    await user.save();
    // sendMail(
    //   email,
    //   "Welcome to StayNest",
    //   `Hello ${name},\n\nWelcome to StayNest! Your account has been created successfully.\n\nThanks,\nTeam StayNest`
    // ).catch(err => console.error("Email error:", err));

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    console.log(token);
    
    return res.status(201).json({ success: true, message: "User registered successfully", token, profileImage: url });

    
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ success: false, error: error.message || "Registration failed" });
  }
  
};
