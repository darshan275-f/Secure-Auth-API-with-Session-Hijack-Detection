import express from 'express';
import {register,logIn,logOut,infoAboutUser,refreshAccessAndrefreshToken} from '../controllers/user.controller.js'
import jwtVerify from '../middlewares/Auth.middleware.js';
import LoginSessionMiddleWare from '../middlewares/loginSession.middleware.js';
const userRouter=express.Router();

userRouter.route('/register').post(register);
userRouter.route('/login').post(logIn);
userRouter.route('/logOut').post(jwtVerify,logOut);
userRouter.route('/me').get(jwtVerify,LoginSessionMiddleWare,infoAboutUser);
userRouter.route('/refresh').post(jwtVerify,LoginSessionMiddleWare,refreshAccessAndrefreshToken)
export default userRouter;