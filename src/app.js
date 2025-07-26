import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import { healthCheck } from "./controllers/healthCheck.controller.js";
import expressUseragent from 'express-useragent';
const useragent = expressUseragent;

dotenv.config({path:'./env'});
const app=express();


//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(useragent.express());


//routes
app.use('/api/v1/user',userRouter);
app.use('/api/v1/health',healthCheck)



export default app;