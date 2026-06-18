import { verifyToken } from "../services/token.service.js";
const authMiddleWare = (req,res,next) => {
    try {
        if(!req.header("Authorization")){
            return  res.status(401).json({success:false, error: "No token provided" });
        }
        
        const token = req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({success:false, error: "No token provided" });
        }

        const decodeTheToken = verifyToken(token);
        console.log(decodeTheToken);

        if(!decodeTheToken){
            return res.status(401).json({success:false, error: "Invalid token" });
        }
        req.user = decodeTheToken;
        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        return res.status(500).json({success:false, error: error.message });
    }
}


export default authMiddleWare;