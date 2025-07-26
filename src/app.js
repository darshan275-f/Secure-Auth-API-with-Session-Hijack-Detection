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



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

app.use(limiter);




//routes
app.use('/api/v1/user',userRouter);
app.use('/api/v1/health',healthCheck)



export default app;