import LoginSession from "../models/LoginSession.model.js"
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import sendEmailAlert from "../utils/sendEmailAlert.js";


const LoginSessionMiddleWare=async(req,res,next)=>{

     try {
     
         const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const device = req.useragent?.platform || 'Unkown' 
       const userId=req.user._id;
        const userInfo=await LoginSession.findOne({owner:userId});
        const user=await User.findById(userId);
        
        if(!userInfo){
         return next();
        }
        if((ip!=userInfo.ipAddress || device!=userInfo.device) && userInfo.emailSent===false)  {
           
           sendEmailAlert(ip,device,user.email);
        }
       
       return next();
     } catch (error) {
        throw new ApiError("error while getting info about login session");
     }

}

export default LoginSessionMiddleWare;