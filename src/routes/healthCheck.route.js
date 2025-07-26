import { healthCheck } from "../controllers/healthCheck.controller.js";
import express from 'express';

const healthRouter=express.Router();

healthRouter.route("/check").get(healthCheck);

export {healthCheck};