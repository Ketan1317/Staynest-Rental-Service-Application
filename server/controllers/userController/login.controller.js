import User from "../../models/user.model.js";
import comparePassword from "../../services/comparePassword.service.js";
import { generateToken } from "../../services/token.service.js";


export const userLogin = async (req, res) => {
  try {
    const {email,password} = req.body;
    console.log(req.body);
    if(!email || !password){
      return res.status(400).json({success:false, error: "email and password are required"});
    }
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if(!user){
        return res.status(401).json({success:false, error: "Invalid email or password"});
    }
    const isCorrect = await comparePassword(password,user.password);
    console.log(isCorrect);
    if(!isCorrect){
        return res.status(401).json({success:false, error: "Invalid email or password"});
    }
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    console.log(token);
    return res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message });
  }
};
