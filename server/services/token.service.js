import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (payload) => {
  console.log("generating token");
  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const verifyToken = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

export default { generateToken, verifyToken };