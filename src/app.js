import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import { healthCheck } from "./controllers/healthCheck.controller.js";
import expressUseragent from 'express-useragent';
import helmet from 'helmet';
import  { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from 'ioredis';
import ErrorHandler from "./middlewares/errorHandler.middleware.js";




const useragent = expressUseragent;

dotenv.config({path:'./env'});
const app=express();




//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(useragent.express());
app.use(helmet());

const redisClient = new Redis();


//rate Limit
const RateLimiter=new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:"middleware",
  points:100,
  duration:1
})

app.use((req,res,next)=>{

    if (req.path === '/api/v1/health/check') return next();

  RateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
    console.log(`Too Many requests!! ${req.ip} is Blocked. Try Later`);
    res.status(429).json({
      success:false,
      message:"Too many Requests!!"
    })
  })
})


//routes
app.use('/api/v1/user',userRouter);
app.use('/api/v1/health',healthCheck);


app.use(ErrorHandler);

export default app;