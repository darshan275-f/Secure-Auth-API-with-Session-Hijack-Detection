import LoginSession from "../models/LoginSession.model.js"
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import sendEmailAlert from "../utils/sendEmailAlert.js";


const LoginSessionMiddleWare=async(req,res,next)=>{

     try {
     
         const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const device = req.useragent?.platform || 'Unknown' 
       const userId=req.user._id;
        const userInfo=await LoginSession.findOne({owner:userId});
        const newUser=await User.findById(userId);
        
   if (!userInfo) {
        if (newUser.lastSession && (ip !== newUser.lastSession.ipAddress || device !== newUser.lastSession.device)) {
            await sendEmailAlert(ip, device, newUser.email);
        }
        await LoginSession.create({
            owner: newUser._id,
            ipAddress: ip,
            device: device
        });
        return next();

    }
    else if ((ip !== userInfo.ipAddress || device !== userInfo.device)) {
        await sendEmailAlert(ip, device, newUser.email);
        userInfo.ipAddress = ip;
        userInfo.device = device;
        await userInfo.save();
    }
          
       
       return next();
     } catch (error) {
        throw new ApiError("error while getting info about login session");
     }

}

export default LoginSessionMiddleWare;