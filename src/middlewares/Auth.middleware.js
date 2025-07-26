import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';

const jwtVerify=async(req,res,next)=>{
  try {
     const AccessToken=req.cookies.accessToken;
     if(!AccessToken){
        throw new ApiError("Token required!!",400);
     }
     const decodeToken=jwt.verify(AccessToken,process.env.AccessTokenSecret);
     if(!decodeToken){
      throw new ApiError("Invalid Token",400);
     } 
     const user=await User.findById(decodeToken._id);
     if(!user){
        throw new ApiError("Unauthroized Access",400);
     }
     req.user=user;
     next();
  } catch (error) {
        throw new ApiError("Error while verifying user",500)
  }
}

export default jwtVerify;