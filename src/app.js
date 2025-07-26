import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import { healthCheck } from "./controllers/healthCheck.controller.js";
import expressUseragent from 'express-useragent';
import { rateLimit } from 'express-rate-limit'

const useragent = expressUseragent;

dotenv.config({path:'./env'});
const app=express();




//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(useragent.express());




//express-rate-limit
const createRateLimiter=(maxReq,time)=>{
    return rateLimit({
        max:maxReq,
        windowMs:time,
        message:'Too many request try later',
        standardHeaders:true,
        legacyHeaders:false
    })
}

app.use(createRateLimiter(100,15*60*1000))



//routes
app.use('/api/v1/user',userRouter);
app.use('/api/v1/health',healthCheck)



export default app;